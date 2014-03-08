/**
 * Header Controller
 *
 * Adds some methods to the scope :
 *		- isActive()	Return whether the location is active or not
 */

function HeaderCtrl($scope, $location) {
	$scope.isActive = function (viewLocation) {
		return viewLocation === $location.path();
	};
};



/**
 * Devices Controller
 *
 * Adds some attributes to the scope :
 *		- devices
 */

function DevicesCtrl($scope, devices) {

	// Get the devices list from the API
	$scope.devices = devices.query(
		function (value, responseHeaders) {
			$scope.devices = value;
		},
		function (httpResponse) {
			toastr.error('Unable to connect to API');
		}
	);

};



/**
 * Agents Controller
 *
 * Adds some attributes to the scope :
 *		- installs
 *
 * Adds some methods to the scope :
 *		- refresh()					Refresh the agents list
 *		- add()						Add the agent stored in $scope.install
 * 		- delete(id)				Delete an agent
 *		- downloadInstaller(id)		Launch the generation/download of an installer
 *		- accept(id)				Accept an agent
 *		- reject(id)				Reject an agent
 *
 */

function InstallsCtrl($scope, $window, installs, socket) {

	/**
	 * Refresh the $scope.installs list by calling the API.
	 */
	$scope.refresh = function () {
		$scope.installs = installs.query(
			function (value, responseHeaders) {
				$scope.installs = value;
			},
			function (httpResponse) {
				toastr.error('Unable to connect to API');
			}
		);
	};

	// Refresh the installs list now
	$scope.refresh();

	/**
	 * Add an agent.
	 * Get the $scope.install object and send it to the API
	 * to add id. Hide the #add modal.
	 */
	$scope.add = function () {
		var d = new Date();
		$scope.install.creation = d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear();
		// Save the installation
		installs.save($scope.install,
			function (value, responseHeaders) {
				$scope.refresh();
			},
			function (httpResponse) {
				toastr.error('Unable to connect to API');
			}
		);
		// Hide modal
		$('#add').modal('hide');
	};

	/**
	 * Delete an agent by it's id.
	 * Hide the #delete modal.
	 */
	$scope.delete = function (id) {
		installs.delete({id: id},
			function (value, responseHeaders) {
				$scope.refresh();
			},
			function (httpResponse) {
				toastr.error('Unable to connect to API');
			}
		);
		// Hide modal
		$('#delete').modal('hide');
	};

	/**
	 * Ask the server for the installer.
	 * He can respond "installer" when the installer is available,
	 * or "generatingInstaller" when the installer is not yet available.
	 */
	$scope.downloadInstaller = function (id) {
		socket.emit('getInstaller', {agentId: id});
	};

	// Listen for events when an installer is available on the server
	socket.on('installer', function (id) {
		$('#download' + id).button('reset');
		window.location.assign('/files/installers/' + id + '.deb');
	});

	// Listen for events when an installer is generating on the server
	socket.on('generatingInstaller', function (id) {
		$('#download' + id).button('loading');
	});

	/**
	 * Accept an agent by its id.
	 */
	$scope.accept = function (id) {
		installs.accept({id: id},
			function (value, responseHeaders) {
				$scope.refresh();
			},
			function (httpResponse) {
				toastr.error('Unable to connect to API');
			}
		);
	};

	/**
	 * Reject an agent by its id.
	 */
	$scope.reject = function (id) {
		installs.reject({id: id},
			function (value, responseHeaders) {
				$scope.refresh();
			},
			function (httpResponse) {
				toastr.error('Unable to connect to API');
			}
		);
	};

	// Remove all the listeners when the controller is destroyed
	$scope.$on('$destroy', function (event) {
		socket.removeAllListeners();
	});

};