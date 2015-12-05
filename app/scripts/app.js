'use strict';

/* global app:true */
var app = angular
    .module('umbrellaApp', [
        'ngCookies',
        'ngResource',
        'ngSanitize',
        'ngRoute',
        'App.addressFilter',
        'App.rangeFilter',
        'App.dobFilter',
        'ui.bootstrap',
        'ezfb',
        'google-maps',
        'ngTable'
    ]);

app.config(function ($httpProvider, $routeProvider,ezfbProvider ) {
    ezfbProvider.setInitParams({
        appId: '293665770841942'
    });
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
//    $httpProvider.interceptors.push('TokenInterceptor');
    $routeProvider
        // .when('/database', {
        //   templateUrl: 'views/database.html',
        //   controller: 'DatabaseCtrl'
        // })
        .when('/bars',{
            templateUrl: 'views/bars.html',
            controller: 'BarsCtrl'
        })
        .when('/users',{
            templateUrl: 'views/users.html',
            controller: 'UsersCtrl'
        })
        .when('/database/:tab', {
            templateUrl: 'views/database.html',
            controller: 'DatabaseCtrl'
        })
        .when('/bars/addBar', {
            templateUrl: 'views/barDetails.html',
            controller: 'BarDetailsCtrl'
        })
        .when('/database/bars/:id', {
            templateUrl: 'views/barDetails.html',
            controller: 'BarDetailsCtrl'
        })
        .when('/database/categories/addCategory', {
            templateUrl: 'views/categoryDetails.html',
            controller: 'CategoryDetailsCtrl'
        })
        .when('/database/categories/:id', {
            templateUrl: 'views/categoryDetails.html',
            controller: 'CategoryDetailsCtrl'
        })
        .when('/database/users/addUser', {
            templateUrl: 'views/userDetails.html',
            controller: 'UserDetailsCtrl'
        })
        .when('/database/users/:id', {
            templateUrl: 'views/userDetails.html',
            controller: 'UserDetailsCtrl'
        })
        .when('/map', {
            templateUrl: 'views/map.html',
            controller: 'MapCtrl'
        })
        .when('/checkins', {
            templateUrl: 'views/checkins.html',
            controller: 'CheckinCtrl'
        })
        .otherwise({
            redirectTo: '/bars'
        });
});
