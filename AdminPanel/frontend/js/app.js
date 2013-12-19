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
	return $resource('http://localhost:8083/device/:id', {id: '@id'}, {update: {method:'PUT'}});
}]);

adminPanelApp.factory('installs', ['$resource', function ($resource) {
	return $resource('http://localhost:8083/install/:id', {id: '@id'}, {update: {method:'PUT'}});
}]);