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
 * Define a service "socket" with two services:
 *      - on(eventName, callback)
 *      - emit(eventName, data, callback)
 */

devHelperApp.factory('socket', function ($rootScope) {

	var socket = io.connect();

	return {

		on: function(eventName, callback) {
			socket.on(eventName, function() {
				var args = arguments;
				$rootScope.$apply(function () {
					if (callback) {
						callback.apply(socket, args);
					}
				});
			});
		},

		emit: function (eventName, data, callback) {
			socket.emit(eventName, data, function () {
				var args = arguments;
				$rootScope.$apply(function () {
					if (callback) {
						callback.apply(socket, args);
					}
				});
			});
		},

		removeAllListeners: function () {
			socket.removeAllListeners();
		}

	};

});

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