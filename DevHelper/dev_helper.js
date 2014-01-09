/**
 * =============================
 *
 * Manages all the applications to dev easily.
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

bootstrap.bootstrap('oms-dev-helper', gracefulExit, function () {
	// Load Modules
	server = require('server');
	// Start
	server.start();
});