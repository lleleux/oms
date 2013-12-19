/**
 * =============================
 * 
 * Main application.
 * 
 * Hold the agent model.
 * Start the GUI and start a connection with the server.
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

// Custom
var connection = require('connection');
var protocol = require('protocol');
var gui = require('gui');



/**
 * Start agent: GUI + Connection
 */

// GUI
gui.start();

// Connection
connection.connect();