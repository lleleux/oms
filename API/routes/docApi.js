/**
 * This API allows to CRUD the devices. There are some
 * additionnal methods to execute commands on devices for
 * example.
 *
 * @module	docApi
 * @name	API Documentation
 */



/**
 * Load modules
 */

// Global
var logger = require('logger');
var Dao = require('db').Dao;
// Custom
var apiAnalyzer = require('apiAnalyzer');



/**
 * Variables
 */

// DAO
var api = new Dao('api', 'doc');



/**
 * Get all the API documentations.
 * For each module (devices/installations...) a document
 * is given with the informations of the API.
 *
 * @method 	findAll
 * @name 	Get all the API documentation
 */

var findAll = function (request, response) {
	api.findAll(function (items) {
		response.send(items);
	});
};



/**
 * Reload the API documentation from the source code.
 * All the API files will be parsed and the documentation will
 * be extracted from it.
 *
 * @method 	reload
 * @name 	Reload the API documentation
 */

var reload = function (request, response) {
	apiAnalyzer.analyze();
	response.send(200);
};



/**
 * Exports
 */

// methods
exports.findAll = findAll;
exports.reload = reload;