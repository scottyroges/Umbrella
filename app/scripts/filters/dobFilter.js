'use strict';

angular.module('App.dobFilter', []).filter('dobFilter', function(){
	return function(input){
		var birthDate = new Date(input.year, input.month, input.day);
		var today = new Date();

		var age = today.getFullYear() - birthDate.getFullYear();
		var m = today.getMonth() - birthDate.getMonth();
		if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
			age--;
		}
		return age;
	}
});