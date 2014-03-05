/**
 * This API allows to get documentation. There are some
 * additionnal commands to reload the documentation from sources
 * for example.
 *
 * @module	doc
 * @name	Documentation
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
var apiDao = new Dao('api', 'doc');
var devHelperDao = new Dao('dev-helper', 'doc');


/**
 * Get all the API documentation.
 * For each module (devices/installations...) a document
 * is given with the informations of the API.
 *
 * @method 	findAllApi
 * @name 	Get all the API documentation
 */
var findAllApi = function (request, response) {
	apiDao.findAll(function (items) {
		response.send(items);
	});
};

/**
 * Get all the dev-helper API documentation.
 * For each module (servers/doc...) a document
 * is given with the informations of the API.
 *
 * @method 	findAllDevHelper
 * @name 	Get all the dev-helper API documentation
 */
var findAllDevHelper = function (request, response) {
	devHelperDao.findAll(function (items) {
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
exports.findAllApi = findAllApi;
exports.findAllDevHelper = findAllDevHelper;
exports.reload = reload;