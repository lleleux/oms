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

function ServicesCtrl($scope, $routeParams, socket) {

	$scope.servers = [];
	$scope.console = {};
	socket.emit('getServers');

	socket.on('servers', function (data) {
		console.log('SERVERS');
		$scope.servers = data;
		// If a server is selected, add a server value
		if ($routeParams.hostname) {
			for (var key in $scope.servers) {
				if ($scope.servers[key].hostname == $routeParams.hostname) {
					$scope.server = $scope.servers[key];
				}
			}
		}
		// If a service is selected, add a service value, ask for console
		if ($routeParams.serviceName) {
			if (!$scope.console[$routeParams.hostname]) {
				$scope.console[$routeParams.hostname] = {};
			}
			socket.emit('getConsole', {hostname: $routeParams.hostname, serviceName: $routeParams.serviceName});
			for (var key in $scope.server.services) {
				if ($scope.server.services[key].name == $routeParams.serviceName) {
					$scope.service = $scope.server.services[key];
				}
			}
		}
	});

	socket.on('console', function (hostname, service, data) {
		$scope.console[hostname][service] = data;
	});

	$scope.start = function (hostname, services) {
		socket.emit('startServices', {hostname: hostname, services: services});
	};

	$scope.stop = function (hostname, services) {
		socket.emit('stopServices', {hostname: hostname, services: services});
	};

	$scope.restart = function (hostname, services) {
		socket.emit('restartServices', {hostname: hostname, services: services});
	};

	$scope.$on('$destroy', function (event) {
		socket.removeAllListeners();
	});

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

	$scope.$on('$destroy', function (event) {
		socket.removeAllListeners();
	});

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

	$scope.$on('$destroy', function (event) {
		socket.removeAllListeners();
	});

};



/**
 * Installer Packages Cntroller
 */

function InstallerCtrl($scope) {

};