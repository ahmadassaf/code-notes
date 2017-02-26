'use strict';

const chalk = require('chalk');

module.exports = {
	note: {
		regex: /[\/\/][\/\*]\s*NOTE\s*(?:\(([^:]*)\))*\s*:?\s*(.*)/i,
		label: ' ✐ NOTE',
		colorer: chalk.green
	},
	optimize: {
		regex: /[\/\/][\/\*]\s*OPTIMIZE\s*(?:\(([^:]*)\))*\s*:?\s*(.*)/i,
		label: ' ↻ OPTIMIZE',
		colorer: chalk.blue
	},
	todo: {
		regex: /[\/\/][\/\*]\s*TODO\s*(?:\(([^:]*)\))*\s*:?\s*(.*)/i,
		label: ' ✓ TODO',
		colorer: chalk.magenta
	},
	hack: {
		regex: /[\/\/][\/\*]\s*HACK\s*(?:\(([^:]*)\))*\s*:?\s*(.*)/i,
		label: ' ✄ HACK',
		colorer: chalk.yellow
	},
	xxx: {
		regex: /[\/\/][\/\*]\s*XXX\s*(?:\(([^:]*)\))*\s*:?\s*(.*)/i,
		label: ' ✗ XXX',
		colorer: chalk.cyan
	},
	fixme: {
		regex: /[\/\/][\/\*]\s*FIXME\s*(?:\(([^:]*)\))*\s*:?\s*(.*)/i,
		label: ' ☠  FIXME',
		colorer: chalk.red
	},
	bug: {
		regex: /[\/\/][\/\*]\s*BUG\s*(?:\(([^:]*)\))*\s*:?\s*(.*)/i,
		label: ' ☢  BUG',
		colorer: chalk.red
	}
};
