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

function InstallsCtrl($scope, $window, installs, socket) {

	socket.on('installer', function (agentId) {
		$('#download' + agentId).button('reset');
		window.location.assign('/files/installers/' + agentId + '.deb');
	});

	socket.on('generatingInstaller', function (agentId) {
		$('#download' + agentId).button('loading');
	});

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

	$scope.downloadInstaller = function (agentId) {
		socket.emit('getInstaller', {agentId: agentId});
	};

	$scope.accept = function (id) {
		installs.accept(
			{id: id},
			function () {$scope.refresh();}
		);
	};

	$scope.reject = function (id) {
		installs.reject(
			{id: id},
			function () {$scope.refresh();}
		);
	};

	$scope.refresh();

	$scope.$on('$destroy', function (event) {
		socket.removeAllListeners();
	});

};