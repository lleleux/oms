/**
 * Application
 */
var adminPanelApp = angular.module('adminPanelApp', ['ngRoute', 'ngResource', 'globalFilters']);

/**
 * Router
 */
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

/**
 * Devices resource
 */
adminPanelApp.factory('devices', ['$resource', function ($resource) {
	return $resource('http://{{hostname}}:{{port}}/device/:id', {id: '@id'}, {
		update: {method: 'PUT'}
	});
}]);

/**
 * Agents resource with some additional methods :
 *		- update
 *		- accept
 *		- reject
 */
adminPanelApp.factory('installs', ['$resource', function ($resource) {
	var actions = {
		update: {
			method:		'PUT'
		},
		accept: {
			method:		'POST',
			url:		'http://{{hostname}}:{{port}}/install/:id/accept'
		},
		reject: {
			method:		'POST',
			url:		'http://{{hostname}}:{{port}}/install/:id/reject'
		}
	};
	return $resource('http://{{hostname}}:{{port}}/install/:id', {id: '@id'}, actions);
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
adminPanelApp.factory('toastr', function() {
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
adminPanelApp.factory('socket', ['toastr', function () {

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