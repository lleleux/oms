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
 * Start the GUI.
 */
/*
bootstrap.bootstrap('oms-dev-helper', gracefulExit, function () {
	// Load Modules
	server = require('server');
	// Start
	server.start();
});*/

var dbInitializer = require('dbInitializer');
dbInitializer.checkConnection('localhost', '27017', 'omsx', function (err) {
	if (!err) {
		dbInitializer.checkConfigCollection('omsx', function (err) {

		});
	}
});