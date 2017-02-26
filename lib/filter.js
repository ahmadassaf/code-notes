'use strict';

const multimatch  = require('multimatch');


let ignoreHidden, patterns;

class Filter {

	constructor(_ignoreHidden, _patterns) {
		ignoreHidden = _ignoreHidden;
		patterns     = _patterns;
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
		if (!ignoreHidden) matchOptions["dot"] = true;
		return multimatch(fileInformation.path, patterns, matchOptions).length;
	}
}
module.exports = Filter;
