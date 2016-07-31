(function() {
  'use strict';
  var Notes, colors, fs, getFilterDirectories, minimatch, path;

  fs = require('fs');

  colors = require('colors');

  path = require('path');

  minimatch = require('minimatch');

  getFilterDirectories = function(rootDir) {
    var data, defaultPatterns, err;
    defaultPatterns = ["node_modules", "components", "bower_components"];
    rootDir = rootDir || '.';
    try {
      data = fs.readFileSync(path.join(rootDir, '.gitignore'), 'utf8');
      if (data) {
        return data.split("\n");
      } else {
        return defaultPatterns;
      }
    } catch (_error) {
      err = _error;
      return defaultPatterns;
    }
  };

  Notes = (function() {
    var eachLineIn;

    Notes.patterns = {
      todo: {
        regexp: /^.*(#|\/\/|\/\*)\s*TODO\W*/,
        label: "✓ TODO".underline.magenta
      },
      note: {
        regexp: /^.*(#|\/\/|\/\*)\s*NOTE\W*/,
        label: "✐ NOTE".underline.blue
      },
      optimize: {
        regexp: /^.*(#|\/\/|\/\*)\s*OPTIMIZE\W*/,
        label: "↘ OPTIMIZE".underline.yellow
      },
      fixme: {
        regexp: /^.*(#|\/\/|\/\*)\s*FIXME\W*/,
        label: "☂ FIXME".underline.red
      }
    };

    Notes.filterExtensions = ["\\.jpg", "\\.jpeg", "\\.mov", "\\.mp3", "\\.gif", "\\.png", "\\.log", "\\.bin", "\\.psd", "\\.swf", "\\.fla", "\\.ico"];

    Notes.skipHidden = true;

    Notes.concurrentFiles = 30;

    function Notes(rootDir) {
      this.rootDir = rootDir;
      if (!this.rootDir) {
        throw "Root directory is required.";
      }
      this.filterDirectories = getFilterDirectories(this.rootDir);
    }

    Notes.prototype.annotate = function() {
      var concurrency, files, output, run;
      files = [];
      this.filesUnderDirectory(this.rootDir, function(file) {
        return files.push(file);
      });
      concurrency = 0;
      output = {};
      run = function() {
        var file, onCompletion, onLine, _results;
        _results = [];
        while (files.length > 0 && concurrency < Notes.concurrentFiles) {
          onLine = function(line, lineNum, filePath) {
            var key, lineNumStr, n, pattern, spaces, _i, _len, _ref, _ref1, _results1;
            _ref = Notes.patterns;
            _results1 = [];
            for (key in _ref) {
              pattern = _ref[key];
              if (line.match(pattern.regexp) != null) {
                if (output[filePath] == null) {
                  output[filePath] = ("* " + (filePath.replace('//', '/')) + "\n").green;
                }
                line = line.replace(pattern.regexp, '');
                spaces = '     ';
                _ref1 = (lineNum + 1).toString();
                for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
                  n = _ref1[_i];
                  spaces = spaces.substring(0, spaces.length - 1);
                }
                lineNumStr = ("Line " + lineNum + ":").grey;
                _results1.push(output[filePath] += "  " + lineNumStr + spaces + pattern.label + " " + line + "\n");
              } else {
                _results1.push(void 0);
              }
            }
            return _results1;
          };
          onCompletion = function(filePath) {
            if (output[filePath] != null) {
              console.log(output[filePath]);
            }
            concurrency--;
            return run();
          };
          file = files.shift();
          eachLineIn(file, onLine, onCompletion);
          _results.push(concurrency++);
        }
        return _results;
      };
      return run();
    };

    Notes.prototype.isInFilteredDirectories = function(f) {
      var pattern, result, _i, _len, _ref;
      result = false;
      _ref = this.filterDirectories;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        pattern = _ref[_i];
        result = result || minimatch(f, pattern);
      }
      return !result;
    };

    Notes.prototype.filesUnderDirectory = function(dir, fileCallback) {
      var error, f, files, filter, _i, _len, _results;
      try {
        files = fs.readdirSync(dir);
        if (files != null) {
          if (Notes.skipHidden) {
            files = (function() {
              var _i, _len, _results;
              _results = [];
              for (_i = 0, _len = files.length; _i < _len; _i++) {
                f = files[_i];
                if (!f.match(/^\./)) {
                  _results.push(f);
                }
              }
              return _results;
            })();
          }
          files = (function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = files.length; _i < _len; _i++) {
              f = files[_i];
              if (this.isInFilteredDirectories(f)) {
                _results.push(f);
              }
            }
            return _results;
          }).call(this);
          _results = [];
          for (_i = 0, _len = files.length; _i < _len; _i++) {
            f = files[_i];
            _results.push(this.filesUnderDirectory("" + dir + "/" + f, fileCallback));
          }
          return _results;
        }
      } catch (_error) {
        error = _error;
        if (error.code === "ENOTDIR") {
          filter = RegExp("(" + (Notes.filterExtensions.join('|')) + ")$");
          if (!dir.match(filter)) {
            return fileCallback(dir);
          }
        } else if (error.code === "ELOOP") {
          return console.log("" + error + "... continuing.");
        } else {
          throw error;
        }
      }
    };

    eachLineIn = function(filePath, onLine, onCompletion) {
      return fs.readFile(filePath, function(err, data) {
        var i, line, lines, _i, _len;
        if (err != null) {
          throw err;
        }
        lines = data.toString('utf-8').split("\n");
        for (i = _i = 0, _len = lines.length; _i < _len; i = ++_i) {
          line = lines[i];
          onLine(line, i + 1, filePath);
        }
        return onCompletion(filePath);
      });
    };

    return Notes;

  })();

  module.exports = Notes;

}).call(this);
