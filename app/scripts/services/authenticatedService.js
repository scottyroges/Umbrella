'use strict';

app.factory('AuthenticatedService',['$http', function($http){
	var auth = {
		isLoggedIn : false,
		isAuthenticated : function(){
			return $http.get('service/validate');
		}
	};
	return auth;
}]);