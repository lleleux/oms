/**
 * =============================
 *
 * Main application.
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

// Custom
var bootstrap = require('bootstrap');
var connection;
var agentCommander;



/**
 * Graceful exit callback
 */

var gracefulExit = function (callback) {
	if (connection) {
		connection.close(callback);
	} else {
		if (callback) callback();
	}
};



/**
 * Bootstrap the application.
 * Start listening to agent connections.
 */

bootstrap.bootstrap('oms-agent-manager', gracefulExit, function () {
	// Load modules
	connection = require('connection');
	agentCommander = require('agentCommander');
	// Start
	agentCommander.listen();
	connection.listen();
});