'use strict';

app.controller('UserDetailsCtrl', ['$scope', '$location', '$routeParams', 'Users', '$http', function($scope,$location, $routeParams, Users, $http){
	//$scope.testAccountValues = [{"title":"True", "value": true}, {"title":"False", "value": false}];

    console.log("userDetails: current profile = " + JSON.stringify($scope.top.profile));
	$scope.addUser = false;
	
	$scope.resetPassword = function(){
		$http.get('service/resetPassword/' + $routeParams.id);

	}
	if($location.path() == '/database/users/addUser'){
		$scope.addUser = true;
		$scope.user = {testAccount : true};
	}
	if($scope.addUser == false){
		Users.get({id:$routeParams.id}, function(u){
			$scope.user= u;
            console.log("userDetails: selected user = " + JSON.stringify($scope.user));
		});
	}
	$scope.testAccountChange = function(){
		if($scope.user.testAccount == true){
			delete $scope.user.local;
		}
	}

	$scope.deleteUser = function(){
		if($scope.addUser == false){
            if($scope.user._id !== $scope.top.profile._id) {
                Users.delete({id: $scope.user._id}, function () {
                    $location.path("/database/users");
                })
            } else {
                console.log("Error: You can delete yourself. Contact the DBA");
            }
		} else {
			$location.path("/database/users");
		}
	};

    $scope.cancel = function(){
        $location.path("/database/users");
    }

	$scope.submitted = false;
	$scope.submit = function(isValid){
		$scope.submitted = true;
		if(isValid){
			console.log("userDetails: submitted user = " + JSON.stringify($scope.user));
			if($scope.addUser==false){
				Users.update({id:$scope.user._id}, $scope.user,
                    function(){
					    $location.path("/database/users");
				    }, function(err){
                        console.log("updating the user failed");
                    });
			} else {
				Users.save({},$scope.user, function(user){
						$location.path("/database/users");
					}, function(err){
						console.log("User creation failed");
				});
			}
		}
};

}]);