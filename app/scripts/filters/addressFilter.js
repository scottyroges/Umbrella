'use strict';

angular.module('App.addressFilter', []).filter('addressFilter', function(){
	return function(input){
		return input.street + ' ' + input.city + ' , ' + input.state + ' ' + input.zipcode;
	}
});