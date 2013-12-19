/**
 * Header Controller
 */

function HeaderCtrl($scope, $location) {
	$scope.isActive = function (viewLocation) {
		return viewLocation === $location.path();
	};
};



/**
 * Devices Controller
 */

function DevicesCtrl($scope, devices) {

	$scope.devices = devices.query(
		function (value, responseHeaders) {
			$scope.devices = value;
		},
		function (httpResponse) {
			$scope.alert = {
				type: "danger",
				message: "Unable to retrieve devices list"
			};
		}
	);

};



/**
 * Installs Controller
 */

function InstallsCtrl($scope, $window, installs) {

	$scope.add = function () {
		var d = new Date();
		$scope.install.creation = d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear();
		// Save the installation
		installs.save(
			$scope.install,
			function () {
				$scope.refresh();
			},
			function () {
			}
		);
		// Hide modal
		$('#add').modal('hide');
	};

	$scope.delete = function (id) {
		installs.delete(
			{id: id},
			function () {
				$scope.refresh();
			},
			function () {
			}
		);
		// Hide modal
		$('#delete').modal('hide');
	};

	$scope.refresh = function () {
		$scope.installs = installs.query(
			function (value) {
				$scope.installs = value;
			},
			function () {
			}
		);
	};

	$scope.download = function (contents) {
		var file = $window.open();
		file.document.write('<pre>' + contents + '</pre>');
		file.focus();
	};

	$scope.accept = function (install) {
/*$http({ method: 'GET', url: '/foo' }).
  success(function (data, status, headers, config) {
    // ...
  }).
  error(function (data, status, headers, config) {
    // ...
  });*/
	};

	$scope.reject = function (install) {

	};

	$scope.refresh();

};