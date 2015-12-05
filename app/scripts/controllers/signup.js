'use strict';

app.controller('SignupCtrl', ['$scope', '$location', 'Users', 'LoginService', 'AuthenticatedService', '$window', function ($scope, $location, Users, LoginService, AuthenticatedService, $window) {
    $scope.submitted = false;
    $scope.submit = function (isValid) {
        $scope.submitted = true;
        if (isValid) {
            console.log(JSON.stringify($scope.user));
            $scope.user.testAccount = false;
            Users.save({}, $scope.user, function (user) {
                var login = {
                    email : $scope.user.auth.email,
                    password : $scope.user.auth.local.password
                };
                LoginService.login(login.email,login.password).success(function(data){
                    $scope.top.profile = data.user;
                    AuthenticatedService.isLoggedIn = true;
                    $window.sessionStorage.token = data.token;
                    $location.path("database/bars");
                }).error(function(status, data){
                    console.log("an unsuccessful login has occurred");
                });
            }, function (err) {
                console.log("User creation failed");
            });

        }
    }
}]);