'use strict';

app.factory('TokenInterceptor', ['$q', '$window', function ($q, $window) {
    return {
        request: function (config) {
            config.headers = config.headers || {};
            if ($window.sessionStorage.token) {
                config.headers['x-access-token'] = $window.sessionStorage.token;
            }
            return config;
        },
 
        response: function (response) {
            return response || $q.when(response);
        }
    };
}]);