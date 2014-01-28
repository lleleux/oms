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
 * Reload the api documentation.
 * This method get the source code from git, and
 * parse it to retrieve all the documentation.
 * The doc is then stored in database to get it
 * easily.
 *
 * @method	reload
 * @name	Reload the API documentation from source code
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