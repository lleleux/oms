var globalFilters = angular.module('globalFilters', []);

globalFilters.filter('newlines', function () {
	return function (text) {
		return text.replace(/\n/g, '<br/>');
	};
});