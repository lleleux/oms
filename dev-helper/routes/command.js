/**
 * This API allows to CRUD commands.
 *
 * @module	command
 * @name	Command
 */



/**
 * Load modules
 */

// Global
var logger = require('logger');
var db = require('db');
// Custom
var scriptsLoader = require('scriptsLoader');



/**
 * Variables
 */

// DAO
var commandDao = new db.Dao('commands');



/**
 * Get a the command with the given id.
 *
 * @method 	findById
 * @name 	Get a command
 * @param 	id {String} required The id of the command to retrieve
 */
var findById = function (request, response) {
	commandDao.findById(request.params.id, function (err, item) {
		if (err) {
			response.send(503, {error: 'Database error: ' + err.message});
		} else {
			if (item) { response.send(200, item); }
			else { response.send(404, {error: 'Unable to find command with id ' + request.params.id}); }
		}
	});
};

/**
 * Get all the commands.
 *
 * @method 	findAll
 * @name 	Get all the commands
 */
var findAll = function (request, response) {
	commandDao.findAll(function (err, items) {
		if (err) {
			response.send(503, {error: 'Database error: ' + err.message});
		} else {
			response.send(200, items);
		}
	});
};

/**
 * Add a command.
 *
 * @method 	insert
 * @name 	Add a command
 * TODO param body
 */
var insert = function (request, response) {
	commandDao.insert(request.body, function (err, item) {
		if (err) {
			response.send(503, {error: 'Database error: ' + err.message});
		} else {
			response.send(200, item);
		}
	});
};

/**
 * Update the command with the given id.
 *
 * @method 	update
 * @name 	Update a command
 * @param 	id {String} required The id of the command to update
 * TODO param body
 */
var update = function (request, response) {
	commandDao.update(request.params.id, request.body, function (err, result) {
		if (err) {
			response.send(503, {error: 'Database error: ' + err.message});
		} else {
			if (result === 0) { response.send(404, {error: 'Unable to find command with id ' + request.params.id}); }
			else { response.send(200, {updated: result}); }
		}
	});
};

/**
 * Remove the command with the given id.
 *
 * @method 	remove
 * @name 	Remove a command
 * @param 	id {String} required The id of the command to remove
 */
var remove = function (request, response) {
	commandDao.remove(request.params.id, function (err, result) {
		if (err) {
			response.send(503, {error: 'Database error: ' + err.message});
		} else {
			if (result === 0) { response.send(404, {error: 'Unable to find device with id ' + request.params.id}); }
			else { response.send(200, {removed: result}); }
		}
	});
};

/**
 * Reload the commands and script from sources.
 *
 * @method 	reload
 * @name 	Reload the commands and scripts from sources
 */
var reload = function (request, response) {
	scriptsLoader.loadDirectory('/home/laurent/OMS/Sources/scripts/');
	response.send(200);
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
exports.reload = reload;