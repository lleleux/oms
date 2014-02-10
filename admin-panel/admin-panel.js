/**
 * =============================
 *
 * Main application.
 *
 * Start the Server with the GUI.
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
 * Declare modules
 */

// Global
var bootstrap = require('bootstrap');
// Custom
var server;



/**
 * Graceful exit callback, called when
 * the application is killed or exited.
 *
 * @callback function called when the callback is done
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
 * Start the Server.
 */

bootstrap.bootstrap('oms-admin-panel', gracefulExit, function () {
	// Load Modules
	server = require('server');
	// Start
	server.start();
});