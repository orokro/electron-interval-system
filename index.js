/*
	index.js
	--------

	Combines the main and preload modules for use export
*/
const main = require('./main.js');
const preload = require('./preload.js');

module.exports = {
	...main,
	...preload
};
