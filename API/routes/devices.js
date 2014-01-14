/**
 * This API allows to CRUD the devices. There are some
 * additionnal methods to execute commands on devices for
 * example.
 *
 * @module	devices
 * @name	Devices
 */



/**
 * Load modules
 */

// Global
var logger = require('logger');



/**
 * Variables
 */

// DAO
var Dao = require('db').Dao;
var devices = new Dao('devices');
var agentManagerMessages = new Dao('agentManagerMessages');



/**
 * Get a the device with the given id.
 *
 * @method 	findById
 * @name 	Get a device
 * @param 	id {String} required The id of the device to retrieve
 * @example	{name: "test", param: "value", param2: "value"}
 */

var findById = function (request, response) {
	devices.findById(request.params.id, function (item) {
		response.send(item);
	});
};



/**
 * Get all the devices.
 *
 * @method 	findAll
 * @name 	Get all the devices
 */

var findAll = function (request, response) {
	devices.findAll(function (items) {
		response.send(items);
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
	devices.insert(request.body, function (result) {
		response.send(result);
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
	devices.update(request.params.id, request.body, function (result) {
		response.send(result);
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
	devices.remove(request.params.id, function (result) {
		response.send(result);
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
	agentManagerMessages.insert(item, function (items) {
		response.send(items[0]);
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