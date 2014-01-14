/**
 * Header Controller
 */

function HeaderCtrl($scope, $location) {
	$scope.isActive = function (viewLocation) {
		return viewLocation === $location.path();
	};
};



/**
 * Main Controller
 */

function ServicesCtrl($scope, socket) {

	$scope.links = {
		"oms-agent": "http://localhost:8080",
		"oms-admin-panel": "http://localhost:8081",
		"oms-dev-helper": "http://localhost:8082"
	};

	if ($scope.console == undefined) {
		$scope.console = {};
	}
	if ($scope.status == undefined) {
		$scope.status = {};
	}

	socket.on('oms-status', function (data) {
		var services = JSON.parse(data);
		for (var serviceName in services) {
			$scope.status[serviceName] = services[serviceName];
		}
	});

	socket.on('mongodb-status', function (data) {
		var services = JSON.parse(data);
		for (var serviceName in services) {
			$scope.status[serviceName] = services[serviceName];
		}
	});

	socket.on('console-init', function (service, data) {
		if ($scope.console[service] == undefined) {
			// Init the console lines
			$scope.console[service] = data;
		}
	});

	socket.on('console-update', function (service, data) {
		// Append the console lines
		$scope.console[service] += data;
	});

	socket.on('result', function () {
		socket.emit('statusService');
	});

	$scope.start = function (service) {
		socket.emit('startService', [service]);
	};

	$scope.stop = function (service) {
		socket.emit('stopService', [service]);
	};

	$scope.restart = function (service) {
		socket.emit('restartService', [service]);
	};

	// Get data
	socket.emit('statusService');
	socket.emit('getConsole');

};



/**
 * API Doc Controller
 */

function ApiDocCtrl($scope, socket, apiDoc) {

	socket.emit('getApiDoc');

	socket.on('apiDoc', function (data) {
		$scope.apis = JSON.parse(data);
	});

	$scope.getClassForMethod = function (method) {
		switch (method.toUpperCase()) {
			case 'GET':
				return 'label-primary';
			case 'POST':
				return 'label-success';
			case 'DELETE':
				return 'label-danger';
			case 'PUT':
				return 'label-warning';
			default:
				return 'label-primary';
		}
	};

	$scope.reload = function () {
		socket.emit('reloadApiDoc');
	};

	$scope.execute = function (route, routeNumber) {
		var url = route.url;
		var error = false;
		route.params.forEach(function (param) {
			var key = ':' + param.name;
			var value = $('#input-' + routeNumber + '-' + param.name).val();
			if (param.require == 'required' && value == '') {
				$('#form-group-' + routeNumber + '-' + param.name).addClass('has-error');
				error = true;
			} else {
				$('#form-group-' + routeNumber + '-' + param.name).removeClass('has-error');
				url = url.replace(key, value);
			}
		});
		if (error) {
			return;
		}
		$http.get('http://localhost:8083' + url)
			.success(function (data, status, headers, config) {
				route.data = data;
				route.status = status;
				route.headers = headers();
			})
			.error(function (data, status, headers, config) {
				route.data = data;
				route.status = status;
				route.headers = headers();
			})
	};

};



/**
 * Commands Controller
 */

function CommandsCtrl($scope, socket) {

	socket.on('commands', function (data) {
		commands = JSON.parse(data);
		$scope.scriptCommands = [];
		$scope.moduleCommands = [];
		commands.forEach(function (command) {
			if (command.script !== undefined) {
				$scope.scriptCommands.push(command);
			} else {
				$scope.moduleCommands.push(command);
			}
		});
	});

	socket.on('scripts', function (data) {
		$scope.scripts = JSON.parse(data);
	});

	$scope.reloadFromDir = function () {
		socket.emit('reloadScripts');
	};

	$scope.decode = function (input) {
		return atob(input);
	};

	socket.emit('getCommands');
	socket.emit('getScripts');

};