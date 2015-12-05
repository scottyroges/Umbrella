'use strict';

app.factory('Users', [ '$resource', function($resource){
	return $resource('/service/users/:id', null,
	{
		'update': { method:'PUT' }
	});

}]);

