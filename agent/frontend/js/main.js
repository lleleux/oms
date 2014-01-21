/**
 * App Module
 */

var app = angular.module('app', []);



/**
 * Define a service "socket" with two services:
 *		- on(eventName, callback)
 *		- emit(eventName, data, callback)
 */

app.factory('socket', function ($rootScope) {

	var socket = io.connect();

	return {

		on: function (eventName, callback) {
			socket.on(eventName, function () {
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



/**
 * Main Controller
 */

app.controller('MainCtrl', function ($scope, socket) {

	socket.on('update', function (data) {
		$scope.model = JSON.parse(data);
	});

	$scope.stopAgent = function () {
		socket.emit('stopAgent');
	};

	$scope.startAgent = function () {
		socket.emit('startAgent');
	};

	$scope.restartAgent = function () {
		socket.emit('restartAgent');
	};

});