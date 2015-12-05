'use strict';

app.factory('LoginService', ['$http', function($http){
	return {
		login : function(email, password){
			return $http.post('service/login', {email:email, password:password});
		}
	}
}])