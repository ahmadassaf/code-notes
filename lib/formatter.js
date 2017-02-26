"use strict";

const chalk        = require('chalk');

module.exports = {
	/**
	 * Takes an individual message object, as output from retrieveMessagesFromLine
	 * and formats it for output.
	 *
	 * @param     {Object}    individualMessage
	 * @property  {String}    individualMessage.author
	 * @property  {String}    individualMessage.message
	 * @property  {String}    individualMessage.label
	 * @property  {Function}  individualMessage.colorer
	 * @property  {Number}    individualMessage.line_number
	 * @param     {Number}    totalNumberOfLines
	 *
	 * @return    {String}    The formatted message string.
	 */
	formatMessageOutput: function formatMessageOutput(individualMessage, totalNumberOfLines) {

		let paddedLineNumber = getPaddedLineNumber(individualMessage.line_number, totalNumberOfLines);
		let finalNoteString  = chalk.gray('  [Line ' + paddedLineNumber + '] ')
		let finalLabelString = individualMessage.label;

		// If we want that the message is also colored the same as the label then individualMessage.colorer(individualMessage.message)
		finalLabelString    += individualMessage.author ? (' from ' + individualMessage.author + ': ') : ': ';
		finalLabelString     = chalk.bold(individualMessage.colorer(finalLabelString));
		finalNoteString     += finalLabelString;
		finalNoteString     += individualMessage.message && individualMessage.message.length ? individualMessage.colorer(individualMessage.message) : chalk.grey('[[no message to display]]');

		return finalNoteString;

		/**
		 * Takes a line number and returns a padded string matching the total number of
		 * characters in totalLinesNumber. EG: A lineNumber of 12 and a
		 * totalLinesNumber of 1323 will return the string '  12'.
		 *
		 * @param   {Number} lineNumber
		 * @param   {Number} totalLinesNumber
		 *
		 * @return  {String}
		 */
		function getPaddedLineNumber(lineNumber, totalLinesNumber) {

			let paddedLineNumberString = '' + lineNumber;
			while (paddedLineNumberString.length < ('' + totalLinesNumber).length) {
				paddedLineNumberString = ' ' + paddedLineNumberString;
			}
			return paddedLineNumberString;
		}
	},

	/**
	 * Formatter function for the file name. Takes a file path, and the total
	 * number of messages in the file, and formats this information for display as
	 * the heading for the file messages.
	 *
	 * @param   {String} filePath
	 * @param   {Number} numberOfMessages
	 *
	 * @return  {String}
	 */
	formatFilePathOutput: function formatFilePathOutput(filePath, numberOfMessages) {

		let filePathOutput = chalk.bold.white('\n* ' + filePath + ' ');
		let messagesString = 'messages';

		if (numberOfMessages === 1) messagesString = 'message';

		filePathOutput += chalk.grey('[' + numberOfMessages + ' ' + messagesString + ']:');

		return filePathOutput;
	}
}
