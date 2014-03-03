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
 * The service with all his configuration will be removed
 * from the server.
 * If the server has no more services, it will also be removed.
 *
 * @method removeService
 * @name Remove a service from the server
 * @param id {String} required The id of the server
 * @param name {String} required The name of the service to remove
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
				item['services.' + request.params.name] = 1;
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
 * Get the config value for the given key on the given server.
 *
 * @method getConfig
 * @name Get the config value for the given key
 * @param id {String} required The id of the server
 * @param key {String} required The key of config to get
 */
var getConfig = function (request, response) {
	serversDao.findById(request.params.id, function (server) {
		if (server) {
			if (server.config[request.params.key]) {
				response.send(server.config[request.params.key]);
			} else {
				response.send("Unable to find config with key " + request.params.key);
			}
		}
		// If no server found...
		else {
			response.send("Unable to find server with id " + request.params.id);
		}
	});
};

/**
 * Set the config value for the given key on the given server.
 * The update will be taken into consideration at the next
 * restart of the services running on the server..
 *
 * @method setServerConfig
 * @name Set the config value for the given key
 * @param id {String} required The id of the server
 * @param key {String} required The key of config to set
 * // TODO value param
 */
var setServerConfig = function (request, response) {
	serversDao.findById(request.params.id, function (server) {
		if (server) {
			if (server.config[request.params.key]) {
				var data = {};
				data['config.' + request.params.key] = request.body.value;
				serversDao.update(server._id, data, function (result) {
					response.send(result);
				});
			} else {
				response.send("Unable to find config with key " + request.params.key);
			}
		}
		// If no server found...
		else {
			response.send("Unable to find server with id " + request.params.id);
		}
	});
	response.send(200);
};

/**
 * Remove the config value for the given key on the given server.
 * The update will be taken into consideration at the next
 * restart of the services running on the server..
 *
 * @method removeServerConfig
 * @name Remove the config value for the given key
 * @param id {String} required The id of the server
 * @param key {String} required The key of config to remove
 */
var removeServerConfig = function (request, response) {
	serversDao.findById(request.params.id, function (server) {
		if (server) {
			if (server.config[request.params.key]) {
				var item = {};
				item['config.' + request.params.key] = 1;
				var id = new db.BSON.ObjectID(request.params.id);
				serversDao._update({_id: id}, {$unset: item}, {}, function (error, result) {
					response.send(result);
				});
			} else {
				response.send("Unable to find config with key " + request.params.key);
			}
		}
		// If no server found...
		else {
			response.send("Unable to find server with id " + request.params.id);
		}
	});
};

/**
 * Add a config value with the given key on the given server.
 * If a config already exists with the given key, send an error.
 * The update will be taken into consideration at the next
 * restart of the services running on the server..
 *
 * @method addConfig
 * @name Add the config value for the given key
 * @param id {String} required The id of the server
 * @param key {String} required The key of config to add
 * TODO value param
 */
var addConfig = function (request, response) {
	serversDao.findById(request.params.id, function (server) {
		if (server) {
			if (!server.config[request.params.key]) {
				var data = {};
				data['config.' + request.params.key] = request.body.value;
				serversDao.update(server._id, data, function (result) {
					response.send(result);
				});
			} else {
				response.send("A config already exists with key " + request.params.key);
			}
		}
		// If no server found...
		else {
			response.send("Unable to find server with id " + request.params.id);
		}
	});
};

/**
 * Set the config value for the given key for the given service
 * on the given server.
 * The update will be taken into consideration at the next
 * restart of the service running on the server..
 *
 * @method setServiceConfig
 * @name Set the config value for the given key
 * @param id {String} required The id of the server
 * @param key {String} required The key of config to set
 * // TODO value param
 */
var setServiceConfig = function (request, response) {
	serversDao.findById(request.params.id, function (server) {
		if (server) {
			if (server.services[request.params.name].config[request.params.key]) {
				var data = {};
				data['services.' + request.params.name + '.config.' + request.params.key] = request.body.value;
				serversDao.update(server._id, data, function (result) {
					response.send(result);
				});
			} else {
				response.send("Unable to find config with key " + request.params.key);
			}
		}
		// If no server found...
		else {
			response.send("Unable to find server with id " + request.params.id);
		}
	});
	response.send(200);
};

/**
 * Remove the config value for the given key of the given service on the given server.
 * The update will be taken into consideration at the next
 * restart of the services running on the server..
 *
 * @method removeServiceConfig
 * @name Remove the config value for the given key
 * @param id {String} required The id of the server
 * @param key {String} required The key of config to remove
 */
var removeServiceConfig = function (request, response) {
	serversDao.findById(request.params.id, function (server) {
		if (server) {
			if (server.services[request.params.name].config[request.params.key]) {
				var item = {};
				item['services.' + request.params.name + '.config.' + request.params.key] = 1;
				var id = new db.BSON.ObjectID(request.params.id);
				serversDao._update({_id: id}, {$unset: item}, {}, function (error, result) {
					response.send(result);
				});
			} else {
				response.send("Unable to find config with key " + request.params.key);
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
exports.getConfig = getConfig;
exports.setServerConfig = setServerConfig;
exports.removeServerConfig = removeServerConfig;
exports.addConfig = addConfig;
exports.setServiceConfig = setServiceConfig;
exports.removeServiceConfig = removeServiceConfig;