'use strict';

app.factory('Categories', [ '$resource', function($resource){
	return $resource('/service/categories/:id', null,
	{
		'update': { method:'PUT' }
	});

}]);

