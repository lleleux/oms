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
 * Load modules
 */

// Global
var db = require('db');
// Custom
var connection = require('connection');
var protocol = require('protocol');
var agentCommander = require('agentCommander');



/**
 * Open database connection and start listening to agent connections
 */

db.connect(function () {
	agentCommander.listen();
	connection.listen();
});