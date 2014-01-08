/**
 * =============================
 *
 * Main application.
 *
 * Hold the model.
 * Start the GUI.
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
var gui;



/**
 * Graceful exit callback
 */

var gracefulExit = function (callback) {
	if (gui) {
		gui.stop(callback);
	} else {
		if (callback) callback();
	}
};



/**
 * Bootstrap the application.
 * Start the GUI.
 */

bootstrap.bootstrap('oms-admin-panel', gracefulExit, function () {
	// Load Modules
	gui = require('gui');
	// Start
	gui.start();
});