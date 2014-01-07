/**
 * Application
 */

var devHelperApp = angular.module('devHelperApp', ['ngRoute', 'ngResource']);



/**
 * Router
 */

devHelperApp.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {

	$routeProvider.when('/', {
		redirectTo: '/overview'
	});
	$routeProvider.when('/404', {
		templateUrl: '/partials/404.html'
	});
	$routeProvider.when('/overview', {
		templateUrl: '/partials/overview.html',
		controller: 'ServicesCtrl'
	});
	$routeProvider.when('/agent', {
		templateUrl: '/partials/agent.html',
		controller: 'ServicesCtrl'
	});
	$routeProvider.when('/agent-manager', {
		templateUrl: '/partials/agent-manager.html',
		controller: 'ServicesCtrl'
	});
	$routeProvider.when('/admin-panel', {
		templateUrl: '/partials/admin-panel.html',
		controller: 'ServicesCtrl'
	});
	$routeProvider.when('/dev-helper', {
		templateUrl: '/partials/dev-helper.html',
		controller: 'ServicesCtrl'
	});
	$routeProvider.when('/api', {
		templateUrl: '/partials/api.html',
		controller: 'ServicesCtrl'
	});
	$routeProvider.when('/api/doc', {
		templateUrl: '/partials/apiDoc.html',
		controller: 'ApiDocCtrl'
	});
	$routeProvider.when('/api/commands', {
		templateUrl: '/partials/commands.html',
		controller: 'CommandsCtrl'
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
		}

	};

});

devHelperApp.factory('apiDoc', ['$resource', function ($resource) {
	return $resource('http://localhost:8083/doc/api/', {}, {
		reload:	{method: 'POST', url: 'http://localhost:8083/doc/api/reload'}
	});
}]);