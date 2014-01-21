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
 * Methods : /
 *
 * Events : /
 *
 * =============================
 */



/**
 * Load modules
 */

// Global
var bootstrap = require('bootstrap');
// Custom
var server;



/**
 * Graceful exit callback
 */

var gracefulExit = function (callback) {
	if (server) {
		server.stop(callback);
	} else {
		if (callback) callback();
	}
};



/**
 * Bootstrap the application.
 * Start the GUI.
 */

bootstrap.bootstrap('oms-api', gracefulExit, function () {
	// Load Modules
	server = require('server');
	// Start
	server.start();
});