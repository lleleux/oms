/**
 * This API allows to access the services. The usual CRUD methods
 * are not available because services are dynamically added, updated...
 * But some special methods are available, for example : start a service,
 * stop a service...
 *
 * @module	service
 * @name	Service
 */



/**
 * Load modules
 */

// Global
var logger = require('logger');
var db = require('db');
var sshCommander = require('sshCommander');



/**
 * Variables
 */

// DAO
var serverDao = new db.Dao('servers');
var configDao = new db.Dao('config');



/**
 * Execute a method on a service on a server.
 * The function that will be executed must send the response.
 *
 * @param request the HTTP request with params
 * @param response the GTTP response to send a response
 * @param toDo the function to execute on the service
 */
var _execute = function (request, response, toDo) {
	serverDao.findById(request.params.id, function (err, server) {
		if (server) {
			// Execute toDo
			if (server.services[request.params.name] !== undefined) {
				toDo(server);
			}
			// If no service found...
			else {
				response.send(404, {error: 'Unable to find service with name ' + request.params.name});
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
 * Remove a service from a server
 * The service with all his configuration will be removed
 * from the server.
 * If the server has no more services, it will also be removed.
 *
 * @method remove
 * @name Remove a service from the server
 * @param id {String} required The id of the server
 * @param name {String} required The name of the service to remove
 */
var remove = function (request, response) {
	_execute(request, response, function (server) {
		// Delete server
		if (Object.keys(server.services).length == 1 && server.services[request.params.name] !== undefined) {
			serverDao.remove(request.params.id, function (err, result) {
				if (err) { response.send(503, {error: 'Database error: ' + err.message}); }
				else { response.send(200, {removed: result}); }
			});
		}
		// Delete service
		else {
			var item = {};
			item['services.' + request.params.name] = 1;
			var id = new db.BSON.ObjectID(request.params.id);
			serverDao._update({_id: id}, {$unset: item}, {}, function (err, result) {
				if (err) { response.send(503, {error: 'Database error: ' + err.message}); }
				else { response.send(200, {removed: result}); }
			});
		}
	});
};

/**
 * Get the last 30 logs of a service
 */
var getLogs = function (request, response) {
	_execute(request, response, function (server) {
		sshCommander.command(server.hostname, 'get-logs', {lines: 30, filename: '/var/log/oms/' + request.params.name.substr(4) + '.log'}, function (err, result) {
			if (result) {
				response.send(200, result.data);
			} else {
				response.send(500, {error: 'Unable to get logs for service "' + request.params.name + '" on "' + server.hostname + '": ' + err.message});
			}
		});
	});
};

/**
 * Get the service config value for the given key on the given server.
 *
 * @method getConfig
 * @name Get the service config value for the given key
 * @param id {String} required The id of the server
 * @param name {String} required The name of the service
 * @param key {String} required The key of config to get
 */
var getConfig = function (request, response) {
	_execute(request, response, function (server) {
		if (server.config[request.params.key] !== undefined) {
			response.send(200, server.config[request.params.key]);
		} else {
			response.send(404, {error: 'Unable to find service config with key ' + request.params.key});
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
 * @method setConfig
 * @name Set the config value for the given key
 * @param id {String} required The id of the server
 * @param name {String} required The name of the service
 * @param key {String} required The key of config to set
 * // TODO value param
 */
var setConfig = function (request, response) {
	_execute(request, response, function (server) {
		var data = {};
		data['services.' + request.params.name + '.config.' + request.params.key] = request.body.value;
		serverDao.update(server._id, data, function (err, result) {
			if (err) { response.send(503, {error: 'Database error: ' + err.message}); }
			else { response.send(200, {updated: result}); }
		});
	});
};

/**
 * Remove the config value for the given key of the given service on the given server.
 * The update will be taken into consideration at the next
 * restart of the services running on the server..
 *
 * @method removeConfig
 * @name Remove the config value for the given key
 * @param id {String} required The id of the server
 * @param name {String} required The name of the service
 * @param key {String} required The key of config to remove
 */
var removeConfig = function (request, response) {
	_execute(request, response, function (server) {
		if (server.services[request.params.name].config === undefined || server.services[request.params.name].config[request.params.key] === undefined) {
			var data = {};
			data['services.' + request.params.name + '.config.' + request.params.key] = 1;
			var id = new db.BSON.ObjectID(request.params.id);
			serverDao._update({_id: id}, {$unset: data}, {}, function (err, result) {
				if (err) { response.send(503, {error: 'Database error: ' + err.message}); }
				else { response.send(200, {removed: result}); }
			});
		} else {
			response.send(404, {error: 'Unable to find service config with key ' + request.params.key});
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
 * @param name {String} required The name of the service
 * @param key {String} required The key of config to add
 * TODO value param
 */
var addConfig = function (request, response) {
	_execute(request, response, function (server) {
		if (server.services[request.params.name].config === undefined || server.services[request.params.name].config[request.params.key] === undefined) {
			var data = {};
			data['services.' + request.params.name + '.config.' + request.params.key] = request.body.value;
			serverDao.update(server._id, data, function (err, result) {
				if (err) { response.send(503, {error: 'Database error: ' + err.message}); }
				else { response.send(200, {inserted: result}); }
			});
		} else {
			response.send(409, {error: 'A service config already exists with key ' + request.params.key});
		}
	});
};

/**
 * Send a start command to the service on the given
 * server.
 *
 * @method start
 * @name Start a service
 * @param id {String} required The id of the server
 * @param name {String} required The name of the service to start
 */
var start = function (request, response) {
	_execute(request, response, function (server) {
		sshCommander.command(server.hostname, 'start-services', {services: [request.params.name]}, function (err, result) {
			if (result) {
				response.send(200, result.data);
			} else {
				response.send(500, {error: 'Unable to start service "' + request.params.name + '" on "' + server.hostname + '": ' + err.message});
			}
		});
	});
};

/**
 * Send a stop command to the service on the given
 * server.
 *
 * @method stop
 * @name Stop a service
 * @param id {String} required The id of the server
 * @param name {String} required The name of the service to stop
 */
var stop = function (request, response) {
	_execute(request, response, function (server) {
		sshCommander.command(server.hostname, 'stop-services', {services: [request.params.name]}, function (err, result) {
			if (result) {
				response.send(200, result.data);
			} else {
				response.send(500, {error: 'Unable to stop service "' + request.params.name + '" on "' + server.hostname + '": ' + err.message});
			}
		});
	});
};

/**
 * Send a restart command to the service on the given
 * server.
 *
 * @method restart
 * @name Restart a service
 * @param id {String} required The id of the server
 * @param name {String} required The name of the service to restart
 */
var restart = function (request, response) {
	_execute(request, response, function (server) {
		sshCommander.command(server.hostname, 'restart-services', {services: [request.params.name]}, function (err, result) {
			if (result) {
				response.send(200, result.data);
			} else {
				response.send(500, {error: 'Unable to restart service "' + request.params.name + '" on "' + server.hostname + '": ' + err.message});
			}
		});
	});
};



/**
 * Exports
 */

// methods
exports.remove = remove;
exports.getLogs = getLogs;
exports.start = start;
exports.stop = stop;
exports.restart = restart;
exports.getConfig = getConfig;
exports.setConfig = setConfig;
exports.removeConfig = removeConfig;
exports.addConfig = addConfig;