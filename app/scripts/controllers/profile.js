'use strict';

app.controller('ProfileCtrl', ['$scope', 'Users', '$location','AuthenticatedService', '$http' ,function($scope, Users, $location,AuthenticatedService, $http){
//    var currentProfile = $scope.top.profile;
//    $scope.user = currentProfile;

    AuthenticatedService.isAuthenticated()
        .success(function (data) {
            $scope.user = data;
        });
    //go out and get user

    $scope.cancel = function(){
        $location.path("/database/users");
    };

    $scope.submitted = false;
    $scope.submit = function(isValid) {
        $scope.submitted = true;
        if (isValid) {
            if(!$scope.changepassword) {
                console.log("profile: submitted user = " + JSON.stringify($scope.user));
                Users.update({id: $scope.user._id}, $scope.user,
                    function () {
                        $location.path("/database/users");
                        $scope.top.profile = $scope.user;
                        //refresh profile
                    }, function (err) {
                        console.log("updating the user failed");
                    });
            } else {
                if($scope.password.new === $scope.password.re) {
                    console.log(JSON.stringify($scope.password));
                    $http.post('/service/changePassword', $scope.password).success(function () {
                        //should be setting the token here
                        $location.path("/database/users");
                    });

                    //make call to change password (old password, new password, repassword)
                }
            }

        }
    }

    $scope.changepassword = false;
    $scope.goToEditProfile = function(){
        $scope.changepassword = false;
        $scope.submitted = false;
        $scope.status = {
            isopen: false
        };
    }

    $scope.goToChangePassword = function(){
        $scope.changepassword = true;
        $scope.submitted = false;
        $scope.status = {
            isopen: false
        };
    }

}]);
