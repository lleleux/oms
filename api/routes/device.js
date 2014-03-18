/**
 * This API allows to CRUD the devices. There are some
 * additionnal methods to execute commands on devices for
 * example.
 *
 * @module	device
 * @name	Device
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
var devicesDao = new db.Dao('devices');
var agentManagerMessagesDao = new db.Dao('agentManagerMessages');



/**
 * Get a the device with the given id.
 *
 * @method 	findById
 * @name 	Get a device
 * @param 	id {String} required The id of the device to retrieve
 * @example	{name: "test", param: "value"}
 */

var findById = function (request, response) {
	devicesDao.findById(request.params.id, function (err, item) {
		if (err) {
			response.send(503, {error: 'Database error: ' + err.message});
		} else {
			if (item) { response.send(200, item); }
			else { response.send(404, {error: 'Unable to find device with id ' + request.params.id}); }
		}
	});
};



/**
 * Get all the devices.
 *
 * @method 	findAll
 * @name 	Get all the devices
 */

var findAll = function (request, response) {
	devicesDao.findAll(function (err, items) {
		if (err) {
			response.send(503, {error: 'Database error: ' + err.message});
		} else {
			response.send(200, items);
		}
	});
};



/**
 * Add a device.
 *
 * @method 	insert
 * @name 	Add a device
 * TODO param body
 */

var insert = function (request, response) {
	devicesDao.insert(request.body, function (err, item) {
		if (err) {
			response.send(503, {error: 'Database error: ' + err.message});
		} else {
			response.send(200, item);
		}
	});
};



/**
 * Update the device with the given id.
 *
 * @method 	update
 * @name 	Update a device
 * @param 	id {String} required The id of the device to update
 * TODO param body
 */

var update = function (request, response) {
	devicesDao.update(request.params.id, request.body, function (err, result) {
		if (err) {
			response.send(503, {error: 'Database error: ' + err.message});
		} else {
			if (result === 0) { response.send(404, {error: 'Unable to find device with id ' + request.params.id}); }
			else { response.send(200, {updated: result}); }
		}
	});
};



/**
 * Remove the device with the given id.
 *
 * @method 	remove
 * @name 	Remove a device
 * @param 	id {String} required The id of the device to remove
 */

var remove = function (request, response) {
	devicesDao.remove(request.params.id, function (err, result) {
		if (err) {
			response.send(503, {error: 'Database error: ' + err.message});
		} else {
			if (result === 0) { response.send(404, {error: 'Unable to find device with id ' + request.params.id}); }
			else { response.send(200, {removed: result}); }
		}
	});
};



/**
 * Execute a command on a device. The command must be identified by
 * it's name. Some parameters could be given aditionnaly.
 *
 * @method 	execute
 * @name 	Execute a command on a Device
 * @param 	id {String} required The id of the device on which the command will be executed
 * @param 	name {String} required The name of the command to execute
 * TODO param body
 */

var execute = function (request, response) {
	var item = {
		device:		request.params.id,
		command:	request.params.name,
		parameters:	{},	// TODO get params
		status:		'new',
		date:		new Date().getTime()	// TODO identify the connected host/user that asked the command
	};
	agentManagerMessagesDao.insert(item, function (err, items) {
		if (err) {
			response.send(503, {error: 'Database error: ' + err.message});
		} else {
			response.send(200, items[0]);
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
exports.execute = execute;