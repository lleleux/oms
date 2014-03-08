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
 * Documentation recource with some additional methods:
 *		- reload
 *		- getApi
 *		- getDevHelper
 */
devHelperApp.factory('doc', ['$resource', function ($resource) {
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
 * Servers resource with some additional methods:
 *		- deleteService
 *		- addServerConfig
 *		- setServerConfig
 *		- removeServerConfig
 *		- addServiceConfig
 *		- setServiceConfig
 *		- removeServiceConfig
 */
devHelperApp.factory('servers', ['$resource', function ($resource) {
	var actions = {
		deleteService: {
			method:	'DELETE',
			url: 	'/api/server/:id/service/:name',
			params:	{id: '@id', name: '@name'}
		},
		addServerConfig: {
			method:	'PUT',
			url:	'/api/server/:id/config/:key',
			params:	{id: '@id', key: '@key'}
		},
		setServerConfig: {
			method:	'POST',
			url:	'/api/server/:id/config/:key',
			params:	{id: '@id', key: '@key'}
		},
		removeServerConfig: {
			method:	'DELETE',
			url:	'/api/server/:id/config/:key',
			params:	{id: '@id', key: '@key'}
		},
		addServiceConfig: {
			method:	'PUT',
			url:	'/api/server/:id/service/:name/config/:key',
			params:	{id: '@id', name: '@name', key: '@key'}
		},
		setServiceConfig: {
			method:	'POST',
			url:	'/api/server/:id/service/:name/config/:key',
			params:	{id: '@id', name: '@name', key: '@key'}
		},
		removeServiceConfig: {
			method:	'DELETE',
			url:	'/api/server/:id/service/:name/config/:key',
			params:	{id: '@id', name: '@name', key: '@key'}
		}
	};
	return $resource('/api/server/:id', {id: '@id'}, actions);
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