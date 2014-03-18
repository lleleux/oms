/**
 * Header Controller
 */
function HeaderCtrl($scope, $location) {
	$scope.isActive = function (viewLocation) {
		return viewLocation === $location.path();
	};
};

/**
 * Services Controlles
 *
 * Add some properties in the scope :
 *		- servers 		All the servers information
 *		- server 		The currently viewing server (selected from url param)
 *		- service 		The currently viewing service (selected from url param)
 *		- console 		The console of the currently viewing server
 *
 * There are also some methods for starting, stopping services...
 */
function ServicesCtrl($scope, $location, $routeParams, serverResource, serviceResource, toastr) {

	$scope.console = {};

	// Set servers
	var setServers = function (data) {
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
			// Search for service in services list
			for (var key in $scope.server.services) {
				if ($scope.server.services[key].name == $routeParams.serviceName) {
					$scope.service = $scope.server.services[key];
				}
			}
			// Remove previous console
			if (!$scope.console[$routeParams.hostname]) {
				$scope.console[$routeParams.hostname] = {};
			}
			// Ask for console
			$scope.console[$routeParams.hostname][$routeParams.serviceName] = $scope.servers = serviceResource.getLogs(
				{id: $scope.server._id, name: $routeParams.serviceName},
				function (value, responseHeaders) {	$scope.console[$routeParams.hostname][$routeParams.serviceName] = value; },
				function (httpResponse) { toastr.error('Unable to retrieve console'); }
			);
		}
	}

	// Get servers
	$scope.servers = serverResource.query(
		function (value, responseHeaders) {
			setServers(value);
		},
		function (httpResponse) {
			toastr.error('Unable to retrieve servers list');
		}
	);

	$scope.start = function (serverId, serviceName) {
		serviceResource.start({id: serverId, name: serviceName});
		toastr.info(serviceName + ' starting on ' + _getServer(serverId).hostname);
	};

	$scope.stop = function (serverId, serviceName) {
		serviceResource.stop({id: serverId, name: serviceName});
		toastr.info(serviceName + ' shutting down on ' + _getServer(serverId).hostname);
	};

	$scope.restart = function (serverId, serviceName) {
		serviceResource.restart({id: serverId, name: serviceName});
		toastr.info(serviceName + ' restarting on ' + _getServer(serverId).hostname);
	};

	$scope.getLink = function (server, serviceName) {
		if (serviceName == 'oms-dev-helper' || serviceName == 'oms-admin-panel') {
			var host = server.config.publicHost ? server.config.publicHost : server.hostname;
			return 'http://' + host + ':' + server.services[serviceName].config.port;
		}
	};

	$scope.deleteServer = function (serverId) {
		serverResource.delete({id: serverId});
		$('#delete').modal('hide');
	};

	$scope.deleteService = function (serverId, serviceName) {
		serviceResource.delete({id: serverId, name: serviceName});
		$('#delete').modal('hide');
	};

	$scope.setEditable = function (isEditable, configKey, value) {
		if (isEditable) {
			// Hide the view and show the edit
			$('.config-' + configKey + '-view').hide();
			$('.config-' + configKey + '-edit').show();
		} else {
			// Hide the edit and show the view
			$('.config-' + configKey + '-edit').hide();
			$('.config-' + configKey + '-view').show();
			// Set the old value in the input
			$('.config-' + configKey + '-edit input:eq(0)').val($scope.server.config[configKey]);
		}
	};

	$scope.addServerConfig = function () {
		var key = $('.config-add input:eq(0)').val();
		var value = $('.config-add input:eq(1)').val();
		var success = function (data, responseHeaders) {
			$scope.server.config[key] = value;
			$scope.setEditable(false, key, value);
			$('.config-add input').val('');
		};
		var error = function (httpResponse) {
			toastr.error('Unable to add server configuration');
		};
		serverResource.addConfig({id: $scope.server._id, key: key}, {value: value}, success, error);
	};

	$scope.setServerConfig = function (key) {
		var value = $('.config-' + key + '-edit input:eq(0)').val();
		var success = function (data, responseHeaders) {
			$scope.server.config[key] = value;
			$scope.setEditable(false, key, value);
		};
		var error = function (httpResponse) {
			toastr.error('Unable to set server configuration');
		};
		serverResource.setConfig({id: $scope.server._id, key: key}, {value: value}, success, error);
	};

	$scope.removeServerConfig = function (key) {
		var success = function (data, responseHeaders) {
			delete($scope.server.config[key]);
		};
		var error = function (httpResponse) {
			toastr.error('Unable to remove server configuration');
		};
		serverResource.removeConfig({id: $scope.server._id, key: key}, null, success, error);
	};

	$scope.addServiceConfig = function () {
		var key = $('.config-add input:eq(0)').val();
		var value = $('.config-add input:eq(1)').val();
		var success = function (data, responseHeaders) {
			$scope.server.config[key] = value;
			$scope.setEditable(false, key, value);
		};
		var error = function (httpResponse) {
			toastr.error('Unable to add service configuration');
		};
		serviceResource.addConfig({id: $scope.server._id, name: $scope.service.name, key: key}, {value: value}, success, error);
	};

	$scope.setServiceConfig = function (key) {
		var value = $('.config-' + key + '-edit input:eq(0)').val();
		var success = function (data, responseHeaders) {
			$scope.service.config[key] = value;
			$scope.setEditable(false, key, value);
		};
		var error = function (httpResponse) {
			toastr.error('Unable to set service configuration');
		};
		serviceResource.setConfig({id: $scope.server._id, name: $scope.service.name, key: key}, {value: value}, success, error);
	};

	$scope.removeServiceConfig = function (key) {
		var success = function (data, responseHeaders) {
			//delete($scope.service.config[key]);
		};
		var error = function (httpResponse) {
			toastr.error('Unable to remove service configuration');
		};
		serviceResource.removeConfig({id: $scope.server._id, name: $scope.service.name, key: key}, null, success, error);
	};

	/**
	 * Search for a server by it's id in the servers list.
	 *
	 * @param id the id of the server to find
	 * @return the server object or null if not found
	 */
	var _getServer = function (id) {
		for (var key in $scope.servers) {
			if ($scope.servers[key]._id == id) {
				return $scope.servers[key];
			}
		}
		return null;
	};

};

/**
 * API Doc Controller
 *
 * Add some properties in the scope :
 *		- Api				An object containing all the API documentation
 *		- devHelper			An object containing all the dev-helper API documentation
 *		- servers			An object containing the available servers for executing methods { api: [{_id: , url: , status: , hostname: }], dev-helper: []}
 *
 * Give some methods for reloading the documentation, or executing
 * some methods...
 */
function ApiDocCtrl($scope, docResource, serverResource, $http, toastr) {

	// Get API documentation
	$scope.api = docResource.getApi(
		function (value, responseHeaders) {
			$scope.api = value;
		},
		function (httpResponse) {
			toastr.error('Unable to retrieve API documentation');
		}
	);

	// Get API documentation
	$scope.devHelper = docResource.getDevHelper(
		function (value, responseHeaders) {
			$scope.devHelper = value;
		},
		function (httpResponse) {
			toastr.error('Unable to retrieve dev-helper API documentation');
		}
	);

	// Get servers list
	$scope.servers = serverResource.query(
		function (value, responseHeaders) {
			$scope.servers = {
				'api':			[],
				'dev-helper':	[]
			};
			value.forEach(function (server) {
				var host = server.config.publicHost ? server.config.publicHost : server.hostname;
				if (server.services['oms-api']) {
					$scope.servers.api.push({
						_id:		server._id,
						hostname:	server.hostname,
						status:		server.services['oms-api'].status,
						url:		'http://' + host + ':' + server.services['oms-api'].config.port
					});
				}
				if (server.services['oms-dev-helper']) {
					$scope.servers['dev-helper'].push({
						_id:		server._id,
						hostname:	server.hostname,
						status:		server.services['oms-dev-helper'].status,
						url:		'http://' + host + ':' + server.services['oms-dev-helper'].config.port
					});
				}
			});
		},
		function (httpResponse) {
			toastr.error('Unable to retrieve servers list');
		}
	);

	/**
	 * Get the label class for the fiven HTTM method.
	 * For example, GET will return a "label-primary" string
	 * to set the label in blue.
	 *
	 * @param method the HTTP method to get the class from (GET/POST...)
	 */
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

	/**
	 * Reload the API documentation from sources
	 */
	$scope.reload = function () {
		docResource.reload(
			function (value, responseHeaders) {
				toastr.success('API Documentation generating...');
			},
			function (httpResponse) {
				toastr.error('Unable to reload API Documentation');
			}
		);
	};

	/**
	 * Execute some API command on a server.
	 * The method checks the parameters before sending.
	 * If no serverUrl passed, a random server will be chosen.
	 *
	 * @param serverUrl the server url to execute the method, like http://server:80/, might be null
	 * @param apiName the name of the api, like "api" or "dev-helper"
	 * @param route the route object to execute
	 * @param routeNumber the route number in the HTML to retrieve params and send results
	 */
	$scope.execute = function (serverUrl, apiName, route, routeNumber) {
		// If no serverUrl, get a default one.
		if (serverUrl == null) {
			for (var key in $scope.servers[apiName]) {
				if ($scope.servers[apiName][key].status == 'running') {
					serverUrl = $scope.servers[apiName][key].url;
				}
			};
		}
		// If no serverUrl found, show an error
		if (serverUrl == null) {
			toastr.error('No API running...');
			return;
		}
		// If the server asked is not running, show an error
		for (var key in $scope.servers[apiName]) {
			if (serverUrl == $scope.servers[apiName][key].url && $scope.servers[apiName][key].status != 'running') {
				toastr.error('The selected API in not running on this server');
				return;
			}
		};
		// Set parameters in the URL
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
		// If an error occurs with the parameters (missing)
		if (error) {
			return;
		}
		// Execute
		$http[route.method](serverUrl + url)
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
function CommandsCtrl($scope, commandResource, scriptResource) {

	// Get commands from API
	commandResource.query(
		function (commands, responseHeaders) {
			$scope.scriptCommands = [];
			$scope.moduleCommands = [];
			commands.forEach(function (command) {
				if (command.script !== undefined) {
					$scope.scriptCommands.push(command);
				} else {
					$scope.moduleCommands.push(command);
				}
			});
		},
		function (httpResponse) {
			toastr.error('Unable to get commands');
		}
	);

	// Get scripts from API
	scriptResource.query(
		function (value, responseHeaders) {
			$scope.scripts = value;
		},
		function (httpResponse) {
			toastr.error('Unable to get commands');
		}
	);

	/**
	 * Reload scripts from sources, call the api reload method.
	 */
	$scope.reloadFromDir = function () {
		commandResource.reload(
			function (value, responseHeaders) {
				toastr.success('Commands and script reloading...');
			},
			function (httpResponse) {
				toastr.error('Unable to reload commands and scripts');
			}
		);
	};

	$scope.decode = function (input) {
		return atob(input);
	};

};

/**
 * Installer Packages Controller
 */
function InstallersCtrl($scope, installerResource, toastr) {

	$scope.installers = [];

	// Get installers list
	$scope.installers = installerResource.query(
		function (value, responseHeaders) {
			$scope.installers = value;
		},
		function (httpResponse) {
			toastr.error('Unable to retrieve installer list');
		}
	);

	$scope.reload = function () {
		installerResource.generate(
			function (value, responseHeaders) {
				toastr.info('Services installers generating...');
			},
			function (httpResponse) {
				toastr.error('Unable to generate installers');
			}
		);
	};

};