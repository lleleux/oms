/**
 * =============================
 *
 * Main application.
 *
 * Provide a REST API for all the clients who
 * wants to manage the OMS ecosystem (agents, db...)
 *
 * =============================
 *
 * Attributes : /
 *
 * Methods : /P
 *
 * Events : /
 *
 * =============================
 */



/**
 * Load modules
 */

// Built-in
var express = require('express');
// Global
var logger = require('logger');
var config = require('config');
var db = require('db');
// Custom
var devices = require('./routes/devices.js');
var installs = require('./routes/installs.js');
var docApi = require('./routes/docApi.js');



/**
 * Variables
 */

var server = express();
var port = config.get('apiPort');



/**
 * Configure server
 */

var allowCrossDomain = function(req, res, next) {
	// Send headers
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
	res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
	// Intercept OPTIONS method
	if ('OPTIONS' == req.method) {
		res.send(200);
	} else {
		next();
	}
};

server.configure(function () {
	server.use(express.logger('dev'));
	server.use(allowCrossDomain);
	server.use(express.bodyParser());
});



/**
 * Routes
 */

// Devices
server.get('/device', devices.findAll);
server.get('/device/:id', devices.findById);
server.post('/device', devices.insert);
server.put('/device/:id', devices.update);
server.delete('/device/:id', devices.remove);
server.post('/device/:id/command/:name', devices.execute);

// Installations
server.get('/install', installs.findAll);
server.get('/install/:id', installs.findById);
server.post('/install', installs.insert);
server.put('/install/:id', installs.update);
server.delete('/install/:id', installs.remove);
server.post('/install/:id/accept', installs.accept);
server.post('/install/:id/reject', installs.reject);

// Documentation
server.get('/doc/api', docApi.findAll);
server.post('/doc/api/reload', docApi.reload);



/**
 * Start the API
 */

db.connect('oms', function () {	// TODO extract
	db.connect('doc', function () {	// TODO extract
		server.listen(port);
		logger.info('[API] Start listening on port ' + port);
	});
});