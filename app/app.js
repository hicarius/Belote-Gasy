'use strict';
// Declare app level module which depends on views, and components?
angular.module('myApp',[
    'ngRoute',
    'myApp.view',
    'myApp.version',
    'myApp.services',
    'myApp.uiClasses',
    'myApp.directives'])
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.otherwise({redirectTo: '/view'});
    }]);

var uiClasses = angular.module('myApp.uiClasses', []);
var myServices = angular.module('myApp.services', []);