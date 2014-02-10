var adminPanelApp = angular.module('adminPanelApp', ['ngRoute', 'ngResource', 'globalFilters']);

adminPanelApp.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {

	$routeProvider.when('/', {
		templateUrl: 'partials/index.html'
	});
	$routeProvider.when('/404', {
		templateUrl: 'partials/404.html'
	});
	$routeProvider.when('/devices', {
		templateUrl: 'partials/devices.html',
		controller: 'DevicesCtrl'
	});
	$routeProvider.when('/install', {
		templateUrl: 'partials/install.html',
		controller: 'InstallsCtrl'
	});

	$routeProvider.otherwise({
		redirectTo: '/404'
	});

	$locationProvider.html5Mode(true);

}]);

adminPanelApp.factory('devices', ['$resource', function ($resource) {
	return $resource('http://localhost:8083/device/:id', {id: '@id'}, {
		update: {method: 'PUT'}
	});
}]);

adminPanelApp.factory('installs', ['$resource', function ($resource) {
	var actions = {
		update: {
			method:		'PUT'
		},
		accept: {
			method:		'POST',
			url:		'http://localhost:8083/install/:id/accept'
		},
		reject: {
			method:		'POST',
			url:		'http://localhost:8083/install/:id/reject'
		}
	};
	return $resource('http://localhost:8083/install/:id', {id: '@id'}, actions);
}]);

/**
 * Define a service "socket" with two services:
 *      - on(eventName, callback)
 *      - emit(eventName, data, callback)
 */

adminPanelApp.factory('socket', function ($rootScope) {

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
