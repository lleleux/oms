/**
 * This API allows to CRUD the installations. There are some
 * additionnal methods to accept ar reject an installation
 * for example.
 *
 * @module	installs
 * @name	Installations
 */



/**
 * Load modules
 */

// Global
var logger = require('logger');
var Dao = require('db').Dao;
// Custom
var ca = require('ca');



/**
 * Variables
 */

// DAO
var installs = new Dao('installs');
var devices = new Dao('devices');



/**
 * Get the installation with the given id.
 *
 * @method	findById
 * @name	Get an install
 * @param	id {String} required The device id
 */

var findById = function(request, response) {
	installs.findById(request.params.id, function (item) {
		response.send(item);
	});
};



/**
 * Get all the installations.
 *
 * @method 	findAll
 * @name 	Get all the installations
 */

var findAll = function(request, response) {
	installs.findAll(function (items) {
		response.send(items);
	});
};



/**
 * Add an installation.
 * This method create also a private key and a certificate
 * to connect to the AgentManager.
 *
 * @method 	insert
 * @name 	Add an installation
 * TODO param body
 */

var insert = function(request, response) {
	installs.insert(request.body, function (result) {
		ca.initializeAgent(result[0]._id, function () {
			installs.findById(result[0]._id, function (item) {
				response.send(item);
			});
		});
	});
};



/**
 * Update the installation with the given id.
 *
 * @method 	update
 * @name 	Update an installation
 * @param 	id {String} required The id of the installation to update
 * TODO param body
 */

var update = function(request, response) {
	installs.update(request.params.id, request.body, function (result) {
		response.send({count: result});
	});
};



/**
 * Remove the installation with the given id.
 *
 * @method 	remove
 * @name 	Remove an installation
 * @param 	id {String} required The id of the installation to remove
 */

var remove = function(request, response) {
	installs.remove(request.params.id, function (result) {
		response.send({count: result});
	});
};



/**
 * Create a new device with the id of the agent, and insert the agent's
 * informations in the new created device :
 * {
 *		id: 'agent id',
 *		agent: { old agent },
 *		more device information
 * }
 *
 * @method 	accept
 * @name 	Accept an installation
 * @param 	id {String} required The id of the installation to accept
 */
var accept = function (request, response) {
	installs.findById(request.params.id, function (install) {
		var id = install._id;
		delete(install._id);
		devices.insert({_id: id, agent: install}, function (device) {
			installs.remove(request.params.id);
			response.send(200);
		});
	});
};



/**
 * Reject an agent and mark his status as banned.
 *
 * @method 	reject
 * @name 	Reject an installation
 * @param 	id {String} required The id of the installation to reject
 * @param 	reason {String} optional The reason of the reject
 */
var reject = function (request, response) {
	ca.banAgent(request.params.id, function () {
		installs.update(request.params.id, {status: 'banned', reason: request.params.reason});
	});
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
exports.accept = accept;
exports.reject = reject;