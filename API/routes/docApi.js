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
 * Exports
 */

// methods
exports.findAll = findAll;