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

devHelperApp.factory('docApi', ['$resource', function ($resource) {
	return $resource('http://localhost:8082/api/doc/api/', {}, {reload: {method: 'POST', url: 'http://localhost:8082/api/doc/api/reload'}});
}]);

devHelperApp.factory('servers', ['$resource', function ($resource) {
	var actions = {
		deleteService: {
			method:'DELETE',
			url: 'http://localhost:8082/api/server/:id/service/:name',
			params: {id: '@id', name: '@name'}
		}
	};
	return $resource('http://localhost:8082/api/server/:id', {id: '@id'}, actions);
}]);