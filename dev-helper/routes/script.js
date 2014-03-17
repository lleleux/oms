/**
 * This API allows to CRUD scripts.
 *
 * @module	script
 * @name	Script
 */



/**
 * Load modules
 */

// Global
var logger = require('logger');
var db = require('db');



/**
 * Variables
 */

// DAO
var scriptDao = new db.Dao('scripts');



/**
 * Get a the script with the given id.
 *
 * @method 	findById
 * @name 	Get a script
 * @param 	id {String} required The id of the script to retrieve
 */

var findById = function (request, response) {
	scriptDao.findById(request.params.id, function (err, item) {
		if (err) {
			response.send(503, {error: 'Database error: ' + err.message});
		} else {
			if (item) { response.send(200, item); }
			else { response.send(404, {error: 'Unable to find script with id ' + request.params.id}); }
		}
	});
};



/**
 * Get all the scripts.
 *
 * @method 	findAll
 * @name 	Get all the scripts
 */

var findAll = function (request, response) {
	scriptDao.findAll(function (err, items) {
		if (err) {
			response.send(503, {error: 'Database error: ' + err.message});
		} else {
			response.send(200, items);
		}
	});
};



/**
 * Add a script.
 *
 * @method 	insert
 * @name 	Add a script
 * TODO param body
 */

var insert = function (request, response) {
	scriptDao.insert(request.body, function (err, item) {
		if (err) {
			response.send(503, {error: 'Database error: ' + err.message});
		} else {
			response.send(200, item);
		}
	});
};



/**
 * Update the script with the given id.
 *
 * @method 	update
 * @name 	Update a script
 * @param 	id {String} required The id of the script to update
 * TODO param body
 */

var update = function (request, response) {
	scriptDao.update(request.params.id, request.body, function (err, result) {
		if (err) {
			response.send(503, {error: 'Database error: ' + err.message});
		} else {
			if (result === 0) { response.send(404, {error: 'Unable to find script with id ' + request.params.id}); }
			else { response.send(200, {updated: result}); }
		}
	});
};



/**
 * Remove the script with the given id.
 *
 * @method 	remove
 * @name 	Remove a script
 * @param 	id {String} required The id of the script to remove
 */

var remove = function (request, response) {
	scriptDao.remove(request.params.id, function (err, result) {
		if (err) {
			response.send(503, {error: 'Database error: ' + err.message});
		} else {
			if (result === 0) { response.send(404, {error: 'Unable to find script with id ' + request.params.id}); }
			else { response.send(200, {removed: result}); }
		}
	});
};



/**
 * Exports
 */

// methods
exports.findById = findById;
exports.findAll = findAll;
exports.insert = insert;
exports.update = update;
exports.remove = remove;