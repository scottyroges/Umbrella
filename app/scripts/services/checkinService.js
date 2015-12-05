'use strict';

app.factory('Checkins', [ '$resource', function($resource){
    return $resource('/service/checkins/:id', null,
        {
            'update': { method:'PUT' }
        });

}]);
