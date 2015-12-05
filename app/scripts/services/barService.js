'use strict';

app.factory('Bars', [ '$resource', function($resource){
	return $resource('/service/bars/:id', null,
	{
		'update': { method:'PUT' }
	});

}]);

