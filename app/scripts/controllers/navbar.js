'use strict';

app.controller('NavbarCtrl', ['$scope', '$location', '$window',function ($scope, $location, $window) {

    $scope.menu = [
        {
            title: 'Bars',
            link : '/bars'
        },
        {
            title: 'Users',
            link: '/users'
        },
        {
            title: 'Database',
            link: '/database/bars'
        },
        {
            title: 'Map',
            link: '/map'
        },
        {
            title: 'Checkins',
            link: '/checkins'
        }
    ];

    $scope.isActive = function (route) {
        return route === $location.path();
    };

    $scope.logout = function () {
        $window.sessionStorage.token = null;
        $scope.top.profile = {};
        $location.path('login');
    };

    $scope.openProfile = function() {
        $location.path('profile');
    }
}]);