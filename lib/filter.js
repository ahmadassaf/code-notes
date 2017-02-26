'use strict';

const multimatch  = require('multimatch');
const _           = require('lodash');

let ignoreHidden, patterns, includePatterns;

class Filter {

	constructor(_ignoreHidden, _patterns, _includePatterns) {
		ignoreHidden    = _ignoreHidden;
		patterns        = _patterns;
		includePatterns = _includePatterns;
	}

	/**
	 * Determines whether or not to let the file through. by ensuring that the
	 * file name does not match one of the excluded directories, and ensuring it
	 * matches one of the file filters.
	 *
	 * It will also ensure that even if a binary file matches the filter patterns,
	 * it will not let it through as searching binary file contents for string
	 * matches will never make sense.
	 *
	 * @param   {String} fileInformation
	 *
	 * @return  {Boolean}
	 */
	fileFilterer(fileInformation) {

		let matchOptions = {};

		// Check if we have any include patterns and those will overwrite any exclude patters
		if (!!includePatterns.length) patterns = includePatterns;

		// We want to extract directory filters and based on those check the directory first
		let directoriesPatterns = _.compact(patterns.map(function(pattern){ if (pattern.indexOf('/') > -1) return pattern  }));
		let filePatterns        = _.difference(patterns, directoriesPatterns);

		if (!ignoreHidden) matchOptions["dot"] = true;

		if (!!directoriesPatterns.length){
			if (!multimatch(fileInformation.path, patterns, matchOptions).length) return false;
		}
		return multimatch(fileInformation.name, filePatterns, matchOptions).length;
	}
}
module.exports = Filter;
