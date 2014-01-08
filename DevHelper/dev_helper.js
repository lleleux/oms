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

// Built-in
var http = require('http');
var fs = require('fs');
var io = require('socket.io');
// Global
var moduleInstaller = require('moduleInstaller');
var db = require('db');
var commander = require('commander');



/**
 * Variables
 */

var port = 8082;
var servicesStatus;
var servicesScript = '/home/laurent/OMS/Sources/DevHelper/services.sh';
// Pre-loaded frequently-user web-pages
var index = fs.readFileSync(__dirname + '/frontend/index.html');
// Dao
var scripts = new db.Dao('scripts');
var commands = new db.Dao('commands');



/**
 * Initialize the WebServer
 */

var server = http.createServer(function (req, res) {
	if (req.url == '/') {
		req.url = '/index.html';
	}
	fs.readFile(__dirname + '/frontend' + req.url, function (err, data) {
		if (err) {
			res.writeHead(404);
			res.write(index);
		} else {
			res.writeHead(200);
			res.write(data);
		}
		res.end();
	});
});



/**
 * Initialize Socket.io client socket
 */

var initClient = function (socket) {
	// Set listeners
	socket.on('stop', function (data) {
		service('stop', data);
	});
	socket.on('start', function (data) {
		service('start', data);
	});
	socket.on('restart', function (data) {
		service('restart', data);
	});
	socket.on('status', function () {
		getAndSendOmsStatus();
		getAndSendMongodbStatus();
	});
	socket.on('console', function () {
		getConsole();
	});
	socket.on('reload', function () {
		moduleInstaller.loadDirectory('/home/laurent/OMS/Sources/Scripts/');
	});
	socket.on('commands', function () {
		commands.findAll(function (result) {
			socket.emit('commands', JSON.stringify(result));
		});
	})
	socket.on('scripts', function () {
		scripts.findAll(function (result) {
			socket.emit('scripts', JSON.stringify(result));
		});
	})
};



/**
 * General methods executing commands
 */

// Execute oms service commands
var service = function (commandName, services) {
	console.log("New OMS command: \"" + commandName + "\" on services: [" + services.toString() + "]");
	// Add the command in the first position in the table before passing it to the command
	services.splice(0, 0, commandName);
	var command = commander.command(servicesScript, services);
	command.on('done', function (data) {
		console.log('OMS Command done in ' + data.elapsed + ' millis !');
		io.sockets.emit('result', JSON.stringify(data.data));
	});
};

/*// Execute mongodb service commands
var db = function (commandName) {
	console.log("New DB command: \"" + commandName);
	// Add the command in the first position in the table before passing it to the command
	var command = commander.command(servicesScript, [commandName]);
	command.on('done', function (data) {
		console.log('DB Command done in ' + data.elapsed + ' millis !');
		io.sockets.emit('result', JSON.stringify(data.data));
	});
}*/

// Get the services status and send it to the browsers
var getAndSendOmsStatus = function () {
	var command = commander.command(servicesScript, ['status', 'oms-agent', 'oms-agent-manager', 'oms-admin-panel', 'oms-dev-helper', 'oms-api']);
	command.on('done', function (data) {
		console.log('Status check ok in ' + data.elapsed + ' millis !')
		io.sockets.emit('oms-status', data.data);
	});
};

// Get the mongodb services status and send it to the browsers
var getAndSendMongodbStatus = function () {
	var command = commander.command(servicesScript, ['status', 'mongodb']);
	command.on('done', function (data) {
		console.log('Status check ok in ' + data.elapsed + ' millis !')
		io.sockets.emit('mongodb-status', data.data);
	});
};

// Get the last 10 logs of each service
var getConsole = function () {
	var command = commander.command('tail', ['-n 10', '/var/log/oms/agent.log']);
	command.on('done', function (data) {
		io.sockets.emit('console-init', 'oms-agent',data.data);
	});
	command = commander.command('tail', ['-n 10', '/var/log/oms/agent-manager.log']);
	command.on('done', function (data) {
		io.sockets.emit('console-init', 'oms-agent-manager', data.data);
	});
	command = commander.command('tail', ['-n 10', '/var/log/oms/admin-panel.log']);
	command.on('done', function (data) {
		io.sockets.emit('console-init', 'oms-admin-panel', data.data);
	});
	command = commander.command('tail', ['-n 10', '/var/log/oms/dev-helper.log']);
	command.on('done', function (data) {
		io.sockets.emit('console-init', 'oms-dev-helper', data.data);
	});
	command = commander.command('tail', ['-n 10', '/var/log/oms/api.log']);
	command.on('done', function (data) {
		io.sockets.emit('console-init', 'oms-api', data.data);
	});
};



/**
 * Start
 */

// Connect to DataBase
db.connect(function () {
	// Start webserver
	server.listen(port);

	// Socket IO
	io = io.listen(server, { log: false });
	io.set('log level', 1);

	// Socket IO handlers
	io.sockets.on('connection', function (socket) {
		initClient(socket);
	});
});




/**
 * Check the services status
 * and stream the log updates
 */

// Services status
setInterval(getAndSendOmsStatus, 3000);

// Stream the log updates
var command = commander.daemon('tail', ['-f', '-n 0', '/var/log/oms/agent.log']);
command.on('data', function (data) {
	io.sockets.emit('console-update', 'oms-agent', data);
});
command = commander.daemon('tail', ['-f', '-n 0', '/var/log/oms/agent-manager.log']);
command.on('data', function (data) {
	io.sockets.emit('console-update', 'oms-agent-manager', data);
});
command = commander.daemon('tail', ['-f', '-n 0', '/var/log/oms/admin-panel.log']);
command.on('data', function (data) {
	io.sockets.emit('console-update', 'oms-admin-panel', data);
});
command = commander.daemon('tail', ['-f', '-n 0', '/var/log/oms/dev-helper.log']);
command.on('data', function (data) {
	io.sockets.emit('console-update', 'oms-dev-helper', data);
});
command = commander.daemon('tail', ['-f', '-n 0', '/var/log/oms/api.log']);
command.on('data', function (data) {
	io.sockets.emit('console-update', 'oms-api', data);
});