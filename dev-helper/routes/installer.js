/**
 * This API allows to get OMS Services installers.
 *
 * @module	installers
 * @name	Services installers
 */



/**
 * Load modules
 */

// Global
var logger = require('logger');
var db = require('db');
var installerGenerator = require('installerGenerator');



/**
 * Get the list of generated services installers.
 *
 * @method 	findAll
 * @name 	Get the list of generated services installers
 */
var findAll = function (request, response) {
	response.send(200, installerGenerator.getInstallers());
};

/**
 * Generate new services installers.
 *
 * @method 	generate
 * @name 	Generate new services installers
 */
var generate = function (request, response) {
	installerGenerator.generateServices();
	response.send(200);
};



/**
 * Exports
 */

// methods
exports.findAll = findAll;
exports.generate = generate;