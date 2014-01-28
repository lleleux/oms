/**
 * This API allows to CRUD the servers.
 *
 * @module	servers
 * @name	Servers
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
var serversDao = new db.Dao('servers');



/**
 * Get all the servers.
 *
 * @method 	findAll
 * @name 	Get all the servers
 */

var findAll = function (request, response) {
	serversDao.findAll(function (items) {
		response.send(items);
	});
};



/**
 * Remove the server with the given id.
 * The server and all his services will be removed from
 * the database.
 * Do this only if the server is no more used otherwise he
 * will be re-inserted in database...
 * This method do not uninstall the service on the server...
 *
 * @method 	remove
 * @name 	Remove a server
 * @param 	id {String} required The id of the server to remove
 */

var remove = function (request, response) {
	serversDao.remove(request.params.id, function (result) {
		response.send(result);
	});
};



/**
 * Remove a service from a server
 */

var removeService = function (request, response) {
	serversDao.findById(request.params.id, function (server) {
		if (server) {
			// Delete server
			if (Object.keys(server.services).length == 1 && server.services[request.params.name] != undefined) {
				serversDao.remove(request.params.id, function (result) {
					response.send(result);
				});
			}
			// Delete service
			else {
				var item = {};
				item['services.' + request.params.name] = "";
				var id = new db.BSON.ObjectID(request.params.id);
				serversDao._update({_id: id}, {$unset: item}, {}, function (error, result) {
					response.send(result);
				});
			}
		}
		// If no server found...
		else {
			response.send("Unable to find server with id " + request.params.id);
		}
	});
};



/**
 * Exports
 */

// methods
exports.findAll = findAll;
exports.remove = remove;
exports.removeService = removeService;