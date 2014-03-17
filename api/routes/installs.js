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
var db = require('db');
// Custom
var ca = require('ca');



/**
 * Variables
 */

// DAO
var installsDao = new db.Dao('installs');
var devicesDao = new db.Dao('devices');



/**
 * Get the installation with the given id.
 *
 * @method	findById
 * @name	Get an install
 * @param	id {String} required The device id
 */
var findById = function(request, response) {
	installsDao.findById(request.params.id, function (err, item) {
		if (err) {
			response.send(503, {error: 'Database error: ' + err.message});
		} else {
			if (item) { response.send(200, item); }
			else { response.send(404, {error: 'Unable to find agent with id ' + request.params.id}); }
		}
	});
};

/**
 * Get all the installations.
 *
 * @method 	findAll
 * @name 	Get all the installations
 */
var findAll = function(request, response) {
	installsDao.findAll(function (err, items) {
		if (err) {
			response.send(503, {error: 'Database error: ' + err.message});
		} else {
			response.send(200, items);
		}
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
	request.body.status = 'created';
	installsDao.insert(request.body, function (err, result) {
		if (err) {
			response.send(503, {error: 'Database error: ' + err.message});
			return;
		}
		ca.initializeAgent(result[0]._id, function (err) {
			if (err) {
				response.send(500, {error: 'Unable to create agent credentials: ' + err.message});
			} else {
				installsDao.findById(result[0]._id, function (err, item) {
					if (err) { response.send(503, {error: 'Database error: ' + err.message}); }
					else { response.send(200, item); }
				});
			}
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
	installsDao.update(request.params.id, request.body, function (err, result) {
		if (err) {
			response.send(503, {error: 'Database error: ' + err.message});
		} else {
			if (result === 0) { response.send(404, {error: 'Unable to find agent with id ' + request.params.id}); }
			else { response.send(200, {updated: result}); }
		}
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
	installsDao.remove(request.params.id, function (err, result) {
		if (err) {
			response.send(503, {error: 'Database error: ' + err.message});
		} else {
			if (result === 0) { response.send(404, {error: 'Unable to find agent with id ' + request.params.id}); }
			else { response.send(200, {removed: result}); }
		}
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
	installsDao.findById(request.params.id, function (err, install) {
		if (install) {
			if (install.status === 'installed') {
				delete(install._id);
				install.status = 'accepted';
				install.acceptedDate = new Date().getTime();
				devicesDao.insert({_id: new db.BSON.ObjectID(request.params.id), agent: install}, function (err, device) {
					if (err) {
						response.send(503, {error: 'Database error: ' + err.message});
					} else {
						installsDao.remove(request.params.id, function (err, result) {
							if (err) { response.send(503, {error: 'Database error: ' + err.message}); }
							else { response.send(200, {info: 'Agent ' + request.params.id + ' accepted'); }
						});
					}
				});
			} else {
				response.send(409, {error: 'Agent must be in status "installed" to be accepted. Current status: ' + install.status});
			}
		} else {
			if (err) { response.send(503, {error: 'Database error: ' + err.message}); }
			else { response.send(404, {error: 'Unable to find agent with id ' + request.params.id}); }
		}
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
	installsDao.findById(request.params.id, function (err, install) {
		if (install) {
			if (install.status === 'installed') {
				installsDao.update(request.params.id, {status: 'banned', banDate: new Date().getTime(), reason: request.params.reason}, function (err, result) {
					if (err) {
						response.send(503, {error: 'Database error: ' + err.message});
					} else {
						ca.generateCrl();
						response.send(200; {info: 'Agent ' + request.params.id + ' rejected'});
					}
				});
			} else {
				response.send(409, {error: 'Agent must be in status "installed" to be rejected. Current status: ' + install.status});
			}
		} else {
			if (err) { response.send(503, {error: 'Database error: ' + err.message}); }
			else { response.send(404, {error: 'Unable to find agent with id ' + request.params.id}); }
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
exports.accept = accept;
exports.reject = reject;