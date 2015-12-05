'use strict';

app.controller('LoginCtrl', ['$scope', 'LoginService', 'AuthenticatedService', '$window', '$location', '$http', 'ezfb' , function($scope, LoginService, AuthenticatedService, $window, $location, $http, ezfb) {
    AuthenticatedService.isAuthenticated()
        .success(function () {
            $location.path("bars");
        });

    $scope.submit = function(){
		if($scope.login.email && $scope.login.password){
			LoginService.login($scope.login.email,$scope.login.password).success(function(data){
                $scope.top.profile = data.user;
				AuthenticatedService.isLoggedIn = true;
				$window.sessionStorage.token = data.token;
                $location.path("bars");
			}).error(function(status, data){
				console.log("an unsuccessful login has occurred");
			});
		}
	}
    $scope.signup = function(){
        $location.path("signup");
    }

    $scope.facebookLogin = function(){

        ezfb.login(function (res) {

            var data = {
                access_token : res.authResponse.accessToken
            };
            $http.post('/Umbrella/service/login-facebook', data)
                .success(function(obj){
                    console.log(JSON.stringify(obj));
                    $scope.top.profile = obj.user;
                    $window.sessionStorage.token = obj.token;
                    $location.path("bars");
                })
                .error(function(){
                    console.log("failed facebook login");
                });
        }, {scope: 'email,user_birthday,user_interests,user_likes,user_photos,user_relationships,user_relationship_details,user_friends'});
    }


}]);