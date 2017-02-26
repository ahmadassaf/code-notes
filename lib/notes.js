'use strict';

const byline         = require('byline');
const eventStream    = require('event-stream');
const fs             = require('fs');
const chalk          = require('chalk');
const readdirp       = require('readdirp');
const _              = require('lodash');

const Filter         = require('./filter');
const formatter      = require('./formatter');
const messageChecks  = require('./messageChecks');

const BAD_EXTENSIONS = ["!*.jpg", "!*.jpeg", "!*.mov", "!*.mp3", "!*.gif", "!*.png", "!*.log", "!*.bin", "!*.psd", "!*.swf", "!*.fla", "!*.ico"];

let scanPath, fileEncoding, lineLengthLimit, gitIgnore, patterns, ignoreHidden;

/**
 * Takes a line of a file and the line number, and returns an array of all of
 * the messages found in that line. Can return multiple messages per line, for
 * example, if a message was annotated with more than one type. EG: FIXME TODO
 *
 * Each message in the array will have a label, a line_number, a colorer, and a
 * message. Will also include an author property if one is found on the
 * message.
 *
 * @param   {String} lineString The
 * @param   {Number} lineNumber
 *
 * @return  {Array}
 */
function retrieveMessagesFromLine(lineString, lineNumber) {

	let messages      = [];
	let messageFormat = {
		author     : null,
		message    : null,
		label      : null,
		colorer    : null,
		line_number: lineNumber
	};

	Object.keys(messageChecks).forEach(function(checkName) {

		let matchResults = lineString.match(messageChecks[checkName].regex);
		let checker      = messageChecks[checkName];
		let thisMessage;

		if (matchResults && matchResults.length) {

			thisMessage         = JSON.parse(JSON.stringify(messageFormat));
			thisMessage.label   = checker.label;
			thisMessage.colorer = checker.colorer;

			if (matchResults[1] && matchResults[1].length) thisMessage.author  = matchResults[1].trim();
			if (matchResults[2] && matchResults[2].length) thisMessage.message = matchResults[2].trim();
		}

		if (thisMessage) messages.push(thisMessage);
	});

	return messages;
}

/**
 * Takes an object representing the messages and other meta-info for the file
 * and calls off to the formatters for the messages, as well as logs the
 * formatted result.
 *
 * @param     {Object}  messagesInfo
 * @property  {String}  messagesInfo.path The file path
 * @property  {Array}   messagesInfo.messages All of the message objects for the file.
 * @property  {String}  messagesInfo.total_lines Total number of lines in the file.
 */
// TODO: this should come
function logMessages(messagesInfo) {

	if (messagesInfo.messages.length) {

		console.log(formatter.formatFilePathOutput(messagesInfo.path, messagesInfo.messages.length));

		messagesInfo.messages.forEach(function(message) {
			console.log(formatter.formatMessageOutput(message, messagesInfo.total_lines));
		});
	}
}

/**
 * Reads through the configured path scans the matching files for messages.
 */
function scanAndProcessMessages() {

	let filter = new Filter(ignoreHidden, patterns);

	let options = {
		root      : scanPath,
		fileFilter: filter.fileFilterer
	};

	let stream = readdirp(options);

	stream.pipe(eventStream.map(function(fileInformation, callback) {
		let input = fs.createReadStream(fileInformation.fullPath, { encoding: fileEncoding }),
			fileMessages = {
				path       : null,
				total_lines: 0,
				messages   : []
			},
			currentFileLineNumber = 1;

		fileMessages.path = fileInformation.path;

		input.pipe(eventStream.split())
			.pipe(eventStream.map(function(fileLineString, cb) {

				let messages, lengthError;

				if (fileLineString.length < lineLengthLimit) {

					messages = retrieveMessagesFromLine(fileLineString, currentFileLineNumber);

					messages.forEach(function(message) {
						fileMessages.messages.push(message);
					});
				} else {

					lengthError = `We are skipping this line because its length is greater than the maximum line-length of ${lineLengthLimit}`;

					fileMessages.messages.push({
						message    : lengthError,
						line_number: currentFileLineNumber,
						label      : ' ⚠ SKIPPING CHECK',
						colorer    : chalk.underline.red
					});
				}
				currentFileLineNumber += 1;
			}));

		input.on('end', function() {
			fileMessages.total_lines = currentFileLineNumber;
			logMessages(fileMessages);
		});
		callback();
	}));
}

/**
 * Takes an options object and over-writes the defaults, then calls off to the
 * scanner to scan the files for messages.
 *
 * @param     {Object}  options
 * @property  {String}  options.path                The base directory to recursively scan for messages. Defaults to process.cwd()
 * @property  {Array}   options.ignored_directories An array of minimatch glob patterns for directories to ignore scanning entirely.
 * @property  {Array}   options.file_patterns       An array of minimatch glob patterns for files to scan for messages.
 * @property  {String}  options.file_encoding       The encoding the files scanned will be opened with, defaults to 'utf8'.
 * @property  {Number}  options.line_length_limit   The number of characters a line can be before it is ignored. Defaults to 1000.
 */
function parseUserOptionsAndScan(options) {

	scanPath           = options.source ? options.source : process.cwd();
	patterns           = options.patterns.length ? _.concat(['**'], options.patterns) : ['**'];
	ignoreHidden       = options.ignoreHidden || false;
	gitIgnore          = options.gitIgnore || false;
	lineLengthLimit    = options.lineLength || 1000;
	fileEncoding       = options.encoding || 'utf8';

	// Add the exclusion list for bad file extensions
	if (options.patterns.length) patterns = patterns.map(function(pattern) {
		if (pattern == "**") return pattern;
		else return (pattern.slice(-1) == "/") ? `!${pattern}**` : `!${pattern}`;
	});

	patterns = _.concat(patterns, BAD_EXTENSIONS);

	if (gitIgnore) {

		try {

			let data = fs.readFileSync(gitIgnore, 'utf8');
			let gitIgnorepatterns = data ? _.compact(data.replace(/[#].*/g, '').replace(/^\s*\n/gm, '').split('\n')) : patterns;
			// We need to makre sure that the .gitignore paths for directories can ignore any file in that path by appending **
			gitIgnorepatterns = gitIgnorepatterns.map(function(pattern) {
				return pattern.slice(-1) == "/" ? `!${pattern}**` : `!${pattern}`;
			});

			patterns = _.concat(patterns, gitIgnorepatterns);
			scanAndProcessMessages();

		} catch (readingGitIgnoreError) {
			return scanAndProcessMessages();
		}
	} else return scanAndProcessMessages();

}

module.exports = parseUserOptionsAndScan;
