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
var configDao = new db.Dao('config');



/**
 * Get all the servers.
 * The services configuration objects are aggregated with
 * the default configuration.
 *
 * @method 	findAll
 * @name 	Get all the servers
 */
var findAll = function (request, response) {
	// Get all the servers
	serversDao.findAll(function (err, servers) {
		// Check for database errors
		if (err) {
			response.send(503, {error: 'Database error: ' + err.message});
			return;
		}
		// Get all the config documents
		configDao.findAll(function (err, config) {
			// Check for database errors
			if (err) {
				response.send(503, {error: 'Database error: ' + err.message});
				return;
			}
			// Get the default config for a given service
			var getConfig = function (service) {
				for (var configKey in config) {
					if (config[configKey].name == service) {
						delete(config[configKey]._id);
						delete(config[configKey].name);
						return config[configKey];
					}
				}
			};
			// For each server
			for (var serverKey in servers) {
				// For each service of the server
				for (var serviceKey in servers[serverKey].services) {
					// Create empty config object if not exists
					if (!servers[serverKey].services[serviceKey].config) {
						servers[serverKey].services[serviceKey].config = {};
					}
					// Copy config if the key not exists, because default values are less important
					var defaultConfig = getConfig(serviceKey);
					for (var configKey in defaultConfig) {
						if (!servers[serverKey].services[serviceKey].config[configKey]) {
							servers[serverKey].services[serviceKey].config[configKey] = defaultConfig[configKey];
						}
					}
				}
			}
			response.send(200, servers);
		});
	});
};

/**
 * Remove the server with the given id.
 * The server and all his services will be removed from
 * the database.
 * Do this only if the server is no more used otherwise he
 * will be re-inserted in database...
 * This method do not uninstall the service on the server...
 * Return the number of removed servers
 *
 * @method 	remove
 * @name 	Remove a server
 * @param 	id {String} required The id of the server to remove
 */
var remove = function (request, response) {
	serversDao.remove(request.params.id, function (err, result) {
		if (err) {
			response.send(503, {error: 'Database error: ' + err.message});
		} else {
			if (result === 0) { response.send(404, {error: 'Unable to find server with id ' + request.params.id}); }
			else { response.send(200, {removed: result}); }
		}
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
	serversDao.findById(request.params.id, function (err, server) {
		if (server) {
			// Delete server
			if (Object.keys(server.services).length == 1 && server.services[request.params.name] !== undefined) {
				serversDao.remove(request.params.id, function (err, result) {
					if (err) { response.send(503, {error: 'Database error: ' + err.message}); }
					else { response.send(200, {removed: result}); }
				});
			}
			// Delete service
			else {
				var item = {};
				item['services.' + request.params.name] = 1;
				var id = new db.BSON.ObjectID(request.params.id);
				serversDao._update({_id: id}, {$unset: item}, {}, function (err, result) {
					if (err) { response.send(503, {error: 'Database error: ' + err.message}); }
					else { response.send(200, {removed: result}); }
				});
			}
		}
		// If no server found...
		else {
			if (err) { response.send(503, {error: 'Database error: ' + err.message}); }
			else { response.send(404, {error: 'Unable to find server with id ' + request.params.id}); }
		}
	});
};

/**
 * Get the server config value for the given key on the given server.
 *
 * @method getServerConfig
 * @name Get the server config value for the given key
 * @param id {String} required The id of the server
 * @param key {String} required The key of the config to get
 */
var getServerConfig = function (request, response) {
	serversDao.findById(request.params.id, function (err, server) {
		if (server) {
			if (server.config[request.params.key] !== undefined) {
				response.send(200, server.config[request.params.key]);
			} else {
				response.send(404, {error: 'Unable to find server config with key ' + request.params.key});
			}
		}
		// If no server found...
		else {
			if (err) { response.send(503, {error: 'Database error: ' + err.message}); }
			else { response.send(404, {error: 'Unable to find server with id ' + request.params.id}); }
		}
	});
};

/**
 * Set the config value for the given key on the given server.
 * The update will be taken into consideration at the next
 * restart of the services running on the server...
 * If the key is not present, add it.
 *
 * @method setServerConfig
 * @name Set the config value for the given key
 * @param id {String} required The id of the server
 * @param key {String} required The key of config to set
 * // TODO value param
 */
var setServerConfig = function (request, response) {
	serversDao.findById(request.params.id, function (err, server) {
		if (server) {
			var data = {};
			data['config.' + request.params.key] = request.body.value;
			serversDao.update(server._id, data, function (err, result) {
				if (err) { response.send(503, {error: 'Database error: ' + err.message}); }
				else { response.send(200, {updated: result}); }
			});
		}
		// If no server found...
		else {
			if (err) { response.send(503, {error: 'Database error: ' + err.message}); }
			else { response.send(404, {error: 'Unable to find server with id ' + request.params.id}); }
		}
	});
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
	serversDao.findById(request.params.id, function (err, server) {
		if (server) {
			if (server.config[request.params.key] !== undefined) {
				var item = {};
				item['config.' + request.params.key] = 1;
				var id = new db.BSON.ObjectID(request.params.id);
				serversDao._update({_id: id}, {$unset: item}, {}, function (err, result) {
					if (err) { response.send(503, {error: 'Database error: ' + err.message}); }
					else { response.send(200, {removed: result}); }
				});
			} else {
				response.send(404, {error: 'Unable to find server config with key ' + request.params.key});
			}
		}
		// If no server found...
		else {
			if (err) { response.send(503, {error: 'Database error: ' + err.message}); }
			else { response.send(404, {error: 'Unable to find server with id ' + request.params.id}); }
		}
	});
};

/**
 * Add a config value with the given key on the given server.
 * If a config already exists with the given key, send an error.
 * The update will be taken into consideration at the next
 * restart of the services running on the server..
 *
 * @method addServerConfig
 * @name Add the config value for the given key
 * @param id {String} required The id of the server
 * @param key {String} required The key of config to add
 * TODO value param
 */
var addServerConfig = function (request, response) {
	serversDao.findById(request.params.id, function (err, server) {
		if (server) {
			if (server.config[request.params.key] === undefined) {
				var data = {};
				data['config.' + request.params.key] = request.body.value;
				serversDao.update(server._id, data, function (err, result) {
					if (err) { response.send(503, {error: 'Database error: ' + err.message}); }
					else { response.send(200, {inserted: result}); }
				});
			} else {
				response.send(409, {error: 'A server config already exists with key ' + request.params.key});
			}
		}
		// If no server found...
		else {
			if (err) { response.send(503, {error: 'Database error: ' + err.message}); }
			else { response.send(404, {error: 'Unable to find server with id ' + request.params.id}); }
		}
	});
};

/**
 * Get the service config value for the given key on the given server.
 *
 * @method getServiceConfig
 * @name Get the service config value for the given key
 * @param id {String} required The id of the server
 * @param key {String} required The key of config to get
 */
var getServiceConfig = function (request, response) {
	serversDao.findById(request.params.id, function (err, server) {
		if (server) {
			if (server.config[request.params.key] !== undefined) {
				response.send(200, server.config[request.params.key]);
			} else {
				response.send(404, {error: 'Unable to find service config with key ' + request.params.key});
			}
		}
		// If no server found...
		else {
			if (err) { response.send(503, {error: 'Database error: ' + err.message}); }
			else { response.send(404, {error: 'Unable to find server with id ' + request.params.id}); }
		}
	});
};

/**
 * Set the service config value for the given key for the given service
 * on the given server.
 * The update will be taken into consideration at the next
 * restart of the service running on the server...
 * If the key is not present, add it.
 *
 * @method setServiceConfig
 * @name Set the config value for the given key
 * @param id {String} required The id of the server
 * @param key {String} required The key of config to set
 * // TODO value param
 */
var setServiceConfig = function (request, response) {
	serversDao.findById(request.params.id, function (err, server) {
		if (server) {
			var data = {};
			data['services.' + request.params.name + '.config.' + request.params.key] = request.body.value;
			serversDao.update(server._id, data, function (err, result) {
				if (err) { response.send(503, {error: 'Database error: ' + err.message}); }
				else { response.send(200, {updated: result}); }
			});
		}
		// If no server found...
		else {
			if (err) { response.send(503, {error: 'Database error: ' + err.message}); }
			else { response.send(404, {error: 'Unable to find server with id ' + request.params.id}); }
		}
	});
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
	serversDao.findById(request.params.id, function (err, server) {
		if (server) {
			if (server.services[request.params.name].config[request.params.key] !== undefined) {
				var item = {};
				item['services.' + request.params.name + '.config.' + request.params.key] = 1;
				var id = new db.BSON.ObjectID(request.params.id);
				serversDao._update({_id: id}, {$unset: item}, {}, function (err, result) {
					if (err) { response.send(503, {error: 'Database error: ' + err.message}); }
					else { response.send(200, {removed: result}); }
				});
			} else {
				response.send(404, {error: 'Unable to find service config with key ' + request.params.key});
			}
		}
		// If no server found...
		else {
			if (err) { response.send(503, {error: 'Database error: ' + err.message}); }
			else { response.send(404, {error: 'Unable to find server with id ' + request.params.id}); }
		}
	});
};

/**
 * Add a config value with the given key on the given server.
 * If a config already exists with the given key, send an error.
 * The update will be taken into consideration at the next
 * restart of the services running on the server..
 *
 * @method addServiceConfig
 * @name Add the config value for the given key
 * @param id {String} required The id of the server
 * @param key {String} required The key of config to add
 * TODO value param
 */
var addServiceConfig = function (request, response) {
	serversDao.findById(request.params.id, function (err, server) {
		if (server) {
			if (server.config[request.params.key] === undefined) {
				var data = {};
				data['services.' + request.params.name + '.config.' + request.params.key] = request.body.value;
				serversDao.update(server._id, data, function (err, result) {
					if (err) { response.send(503, {error: 'Database error: ' + err.message}); }
					else { response.send(200, {inserted: result}); }
				});
			} else {
				response.send(409, {error: 'A service config already exists with key ' + request.params.key});
			}
		}
		// If no server found...
		else {
			if (err) { response.send(503, {error: 'Database error: ' + err.message}); }
			else { response.send(404, {error: 'Unable to find server with id ' + request.params.id}); }
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

exports.getServerConfig = getServerConfig;
exports.setServerConfig = setServerConfig;
exports.removeServerConfig = removeServerConfig;
exports.addServerConfig = addServerConfig;

exports.getServiceConfig = getServiceConfig;
exports.setServiceConfig = setServiceConfig;
exports.removeServiceConfig = removeServiceConfig;
exports.addServiceConfig = addServiceConfig;