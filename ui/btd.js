require.config({ 
    paths: {
        'angular': 'lib/angular.min',
        'angular-route': 'lib/angular-route.min',
        'angular-resource': 'lib/angular-resource.min',
        'satellizer': 'lib/satellizer.min',
        // 'bootstrap': 'lib/bootstrap.min'
        'bootstrap': 'lib/ui-bootstrap-tpls-2.5.0.min'
    },
    shim: { 
        'angular-route': ['angular'],
        'angular-resource': ['angular'],
        'satellizer': ['angular'],
        'bootstrap': ['angular']
    }
});

define([
    'angular',
    'angular-route',
    'angular-resource',
    'satellizer',
    'bootstrap',
    'controllers/root-ctrl',
    'controllers/weekend-ctrl',
    'controllers/pescadores-ctrl',
    'controllers/pescadore-ctrl',
    'controllers/candidates-ctrl',
    'controllers/admin-ctrl'
], function (ng, ngRoute, ngResource, satellizer, bootstrap, rootCtrl, weekendCtrl, pescadoresCtrl, pescadoreCtrl, candidatesCtrl, adminCtrl) {
    console.log('Loaded!');
    angular
        .module('btd', ['ngRoute', 'ngResource', 'satellizer', 'ui.bootstrap'])
        .controller('rootCtrl', rootCtrl)
        .controller('weekendCtrl', weekendCtrl)
        .controller('pescadoresCtrl', pescadoresCtrl)
        .controller('pescadoreCtrl', pescadoreCtrl)
        .controller('candidatesCtrl', candidatesCtrl)
        .controller('adminCtrl', adminCtrl)
        .filter('name', function () {
            return function (person) {
                if (person.preferredName) {
                    return `${person.preferredName} ${person.lastName}`;
                }
                return `${person.firstName} ${person.lastName}`;
            };
        })
        .config(function ($routeProvider, $locationProvider) {
            $routeProvider
                .when('/login', {
                    templateUrl: '/partials/login.html'
                })
                .when('/admin', {
                    templateUrl: '/partials/admin.html',
                    controller: 'adminCtrl',
                    controllerAs: '$ctrl'
                })
                .when('/weekend/:gender', {
                    templateUrl: '/partials/weekend.html',
                    controller: 'weekendCtrl',
                    controllerAs: '$ctrl'
                })
                .when('/pescadores', {
                    templateUrl: '/partials/pescadores.html',
                    controller: 'pescadoresCtrl',
                    controllerAs: '$ctrl'
                })
                .when('/pescadores/:_id', {
                    templateUrl: '/partials/pescadore.html',
                    controller: 'pescadoreCtrl',
                    controllerAs: '$ctrl'
                })
                .when('/candidates/:gender', {
                    templateUrl: '/partials/candidates.html',
                    controller: 'candidatesCtrl',
                    controllerAs: '$ctrl'
                })
                .otherwise({
                    templateUrl: '/partials/home.html'
                })
        });
    angular.bootstrap(document, ['btd']);
});
