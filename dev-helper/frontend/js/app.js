/**
 * Application
 */
var devHelperApp = angular.module('devHelperApp', ['ngRoute', 'ngResource']);

/**
 * Router
 */
devHelperApp.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {

	$routeProvider.when('/', {
		redirectTo: '/services'
	});
	$routeProvider.when('/404', {
		templateUrl: '/partials/404.html'
	});
	$routeProvider.when('/services', {
		templateUrl: '/partials/services.html',
		controller: 'ServicesCtrl'
	});
	$routeProvider.when('/doc/api', {
		templateUrl: '/partials/apiDoc.html',
		controller: 'ApiDocCtrl'
	});
	$routeProvider.when('/doc/commands', {
		templateUrl: '/partials/commands.html',
		controller: 'CommandsCtrl'
	});
	$routeProvider.when('/server/:hostname', {
		templateUrl: '/partials/server.html',
		controller: 'ServicesCtrl'
	});
	$routeProvider.when('/server/:hostname/:serviceName', {
		templateUrl: '/partials/service.html',
		controller: 'ServicesCtrl'
	});
	$routeProvider.when('/installers', {
		templateUrl: '/partials/installers.html',
		controller: 'InstallersCtrl'
	});

	$routeProvider.otherwise({
		redirectTo: '/404'
	});

	$locationProvider.html5Mode(true);

}]);

/**
 * Documentation resource with some additional methods:
 *		- reload
 *		- getApi
 *		- getDevHelper
 */
devHelperApp.factory('docResource', ['$resource', function ($resource) {
	var actions = {
		reload: {
			method:	'POST',
			url: 	'/api/doc/reload'
		},
		getApi: {
			method:	'GET',
			isArray: true,
			url: 	'/api/doc/api'
		},
		getDevHelper: {
			method:	'GET',
			isArray: true,
			url: 	'/api/doc/dev-helper'
		}
	};
	return $resource('/api/doc/api/', {}, actions);
}]);

/**
 * Installers resource with some additional methods:
 *		- generate
 */
devHelperApp.factory('installerResource', ['$resource', function ($resource) {
	var actions = {
		generate: {
			method:	'POST',
			url: 	'/api/installer/generate'
		}
	};
	return $resource('/api/installer', {}, actions);
}]);

/**
 * Servers resource with some additional methods:
 *		- deleteService
 *		- addServerConfig
 *		- setServerConfig
 *		- removeServerConfig
 *		- addServiceConfig
 *		- setServiceConfig
 *		- removeServiceConfig
 */
devHelperApp.factory('serverResource', ['$resource', function ($resource) {
	var actions = {
		addConfig: {
			method:	'PUT',
			url:	'/api/server/:id/config/:key',
			params:	{id: '@id', key: '@key'}
		},
		setConfig: {
			method:	'POST',
			url:	'/api/server/:id/config/:key',
			params:	{id: '@id', key: '@key'}
		},
		removeConfig: {
			method:	'DELETE',
			url:	'/api/server/:id/config/:key',
			params:	{id: '@id', key: '@key'}
		}
	};
	return $resource('/api/server/:id', {id: '@id'}, actions);
}]);

/**
 * Service resource with some additional methods:
 *		- deleteService
 *		- addServiceConfig
 *		- setServiceConfig
 *		- removeServiceConfig
 */
devHelperApp.factory('serviceResource', ['$resource', function ($resource) {
	var actions = {
		addConfig: {
			method:	'PUT',
			url:	'/api/server/:id/service/:name/config/:key',
			params:	{id: '@id', name: '@name', key: '@key'}
		},
		setConfig: {
			method:	'POST',
			url:	'/api/server/:id/service/:name/config/:key',
			params:	{id: '@id', name: '@name', key: '@key'}
		},
		removeConfig: {
			method:	'DELETE',
			url:	'/api/server/:id/service/:name/config/:key',
			params:	{id: '@id', name: '@name', key: '@key'}
		},
		start: {
			method:	'POST',
			url:	'/api/server/:id/service/:name/start',
			params:	{id: '@id', name: '@name'}
		},
		stop: {
			method:	'POST',
			url:	'/api/server/:id/service/:name/stop',
			params:	{id: '@id', name: '@name'}
		},
		restart: {
			method:	'POST',
			url:	'/api/server/:id/service/:name/restart',
			params:	{id: '@id', name: '@name'}
		},
		getLogs: {
			method:	'GET',
			url:	'/api/server/:id/service/:name/logs',
			params:	{id: '@id', name: '@name'},
			responseType:	'text'
		}
	};
	return $resource('/api/server/:id/service/:name', {id: '@id'}, actions);
}]);

/**
 * Command resource
 */
devHelperApp.factory('commandResource', ['$resource', function ($resource) {
	var actions = {
		update: {
			method: 'PUT'
		},
		reload: {
			method:	'POST',
			url: 	'/api/command/reload'
		}
	}
	return $resource('/api/command/:id', {id: '@id'}, actions);
}]);

/**
 * Script resource
 */
devHelperApp.factory('scriptResource', ['$resource', function ($resource) {
	return $resource('/api/script/:id', {id: '@id'}, {
		update: {method: 'PUT'}
	});
}]);

/**
 * Toast notifications service
 * This service loads some configuration like, the show duration,
 * timeout... This toastr methods are available:
 *		- success(message, title)
 *		- info(message, title)
 *		- warning(message, title)
 *		- error(message, title)
 */
devHelperApp.factory('toastr', function() {
	toastr.options = {
		"closeButton": false,
		"debug": false,
		"positionClass": "toast-top-right",
		"onclick": null,
		"showDuration": "10000",
		"hideDuration": "1000",
		"timeOut": "5000",
		"extendedTimeOut": "1000",
		"showEasing": "swing",
		"hideEasing": "linear",
		"showMethod": "fadeIn",
		"hideMethod": "fadeOut"
	};
	return {
		success:	function (message, title) { toastr.success(message, title) },
		info:		function (message, title) { toastr.info(message, title) },
		warning:	function (message, title) { toastr.warning(message, title) },
		error:		function (message, title) { toastr.error(message, title) }
	};
});

/**
 * Real-time connection service through socket.io
 * Some methods are available
 *      - on(eventName, callback)
 *      - emit(eventName, data, callback)
 *		- remove(eventName, callback)
 */
devHelperApp.factory('socket', ['toastr', function () {

	// Connect to the server
	var socket = io.connect('http://{{hostname}}', {
		'reconnection delay':			500,		// 0,5s
		'reconnection limit':			10000,		// 10s (but in reality, 16s... Socket.io multiply always by two and look to be not over the limit: 1,2,4,8,16,32...)
		'max reconnection attempts':	Infinity,
	});

	// Listen on connection/disconnection/reconnection events
	socket.on('connect', function() {
		toastr.success('Connected in real-time with server');
	});
	socket.on('disconnect', function() {
		toastr.error('Real-time connection with server loosed...');
	});
	socket.on('reconnecting', function() {
		toastr.info('Try to establish again a Real-time connection with server...');
	});

	// Return an object with some methods
	return {
		on: function(eventName, callback) {
			socket.on(eventName, callback);
		},
		emit: function (eventName, data, callback) {
			socket.emit(eventName, data, callback);
		},
		remove: function (eventName, callback) {
			socket.removeListener(eventName, callback);
		}
	};

}]);