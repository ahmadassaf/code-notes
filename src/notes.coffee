fs = require 'fs'
colors = require 'colors'

# The Notes class holds all the logic needed for crawling a directory of files, 
# searching for a set of patterns to annotate.
#
# Samples:
# NOTE: This line should get annoated by Notes.
# OPTIMIZE Make things faster!
# TODO: Annotate your tasks.
# FIXME: Keep up with things to fix.
#
class Notes
  
  # Defines the patterns that will be checked during file annotating.
  # If you want to run this on something other than ruby, coffeesciprt, or javascript 
  # files then you may need to change this. The default pattern is looking for a line 
  # beginning with a comment and then followed with "TODO", "NOTE", or "OPTIMIZE" keywords. 
  #
  @patterns =
    todo:
      regexp: /^.*(#|\/\/|\/\*)\s*TODO\W*/
      label:  "✓ TODO".underline.magenta
    note:
      regexp: /^.*(#|\/\/|\/\*)\s*NOTE\W*/
      label:  "✐ NOTE".underline.blue
    optimize:
      regexp: /^.*(#|\/\/|\/\*)\s*OPTIMIZE\W*/
      label:  "↘ OPTIMIZE".underline.yellow
    fixme:
      regexp: /^.*(#|\/\/|\/\*)\s*FIXME\W*/
      label:  "☂ FIXME".underline.red
  
  # You can also customize what types of file extensions will be filtered out of annotation.
  @filterExtensions = [
    "\\.jpg", "\\.jpeg", "\\.mov", "\\.mp3", "\\.gif", "\\.png", 
    "\\.log", "\\.bin", "\\.psd", "\\.swf", "\\.fla", "\\.ico"
  ]
  
  # You can filter out full directory trees
  @filterDirectories = ["node_modules"]
  
  @skipHidden = true
  
  @concurrentFiles = 30
  
  constructor: (@rootDir) ->
    # Constructor must take at least a root directory as first argument
    throw "Root directory is required." unless @rootDir
    
  annotate: ->
    files = []
    filesUnderDirectory @rootDir, (file) ->
      files.push file
    
    # Simple way to control # of files being opened at a time...
    concurrency = 0
    output = {}
    
    # TODO: Clean this up some. The implementation got much more complex than I originally planned.
    run = ->
      while files.length > 0 and concurrency < Notes.concurrentFiles
        # For each line in the file, check the patterns and output any matches
        onLine = (line, lineNum, filePath) ->
          for key, pattern of Notes.patterns
            if line.match(pattern.regexp)?
              output[filePath] = "* #{filePath.replace('//','/')}\n".green unless output[filePath]?
              line = line.replace(pattern.regexp, '')
              # Make the output kinda pretty...
              spaces = '     '
              spaces = spaces.substring(0, spaces.length-1) for n in (lineNum+1).toString()
              lineNumStr = "Line #{lineNum}:".grey
              output[filePath] += "  #{lineNumStr}#{spaces}#{pattern.label} #{line}\n"
            
        onCompletion = (filePath) ->
          # Spit out the results for the file
          console.log output[filePath] if output[filePath]?
          concurrency--
          run()
      
        file = files.shift()
        # Process the file line-by-line
        eachLineIn file, onLine, onCompletion
        concurrency++
    run()
  
  filesUnderDirectory = (dir, fileCallback) ->
    try
      files = fs.readdirSync dir
      # If it's another directory, make a recursive call into it
      if files?
        files = (f for f in files when !f.match(/^\./)) if Notes.skipHidden # Skip hidden files/directories
        files = (f for f in files when Notes.filterDirectories.indexOf(f) < 0) # Skip directories that should be filtered
        filesUnderDirectory("#{dir}/#{f}", fileCallback) for f in files
    catch error
      if error.code is "ENOTDIR"
        filter = ///(#{Notes.filterExtensions.join('|')})$/// # skip files matching filterExtensions
        # It's a file, so pass it to the callback
        fileCallback dir unless dir.match(filter)
      else if error.code is "ELOOP"
        console.log "#{error}... continuing."
      else
        throw error
        
  eachLineIn = (filePath, onLine, onCompletion) ->
    fs.readFile filePath, (err, data) ->
      throw err if err?
      # OPTIMIZE: can this handle large files well?
      lines = data.toString('utf-8').split("\n")
      onLine(line, i+1, filePath) for line, i in lines
      onCompletion(filePath)

module.exports = Notes