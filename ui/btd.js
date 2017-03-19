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
    'controllers/admin-ctrl',
    'services/auth-svc',
    'services/current-weekend-svc'
], function (
    ng, 
    ngRoute, 
    ngResource, 
    satellizer, 
    bootstrap, 
    rootCtrl, 
    weekendCtrl, 
    pescadoresCtrl, 
    pescadoreCtrl, 
    candidatesCtrl, 
    adminCtrl,
    authSvc,
    currentWeekendSvc
    ) {
    angular
        .module('btd', ['ngRoute', 'ngResource', 'satellizer', 'ui.bootstrap'])
        .controller('rootCtrl', rootCtrl)
        .controller('weekendCtrl', weekendCtrl)
        .controller('pescadoresCtrl', pescadoresCtrl)
        .controller('pescadoreCtrl', pescadoreCtrl)
        .controller('candidatesCtrl', candidatesCtrl)
        .controller('adminCtrl', adminCtrl)
        .service('authSvc', authSvc)
        .service('currentWeekendSvc', currentWeekendSvc)
        .constant('btdConstants', {
            genders: {
                male: {
                    weekendLabel: 'Men\'s', 
                    alternative: 'female'
                },
                female: {
                    weekendLabel: 'Women\'s', 
                    alternative: 'male'
                }
            }
        })
        .filter('name', function () {
            return function (person) {
                if (person.preferredName) {
                    return `${person.preferredName} ${person.lastName}`;
                }
                return `${person.firstName} ${person.lastName}`;
            };
        })
        .filter('weekendGender', ['btdConstants', function(constants) {
            return function (person, isAlternate) {
                if (!person || !person.gender) {
                    return 'Unknown';
                }
                let gender = constants.genders[person.gender];
                if (isAlternate) {
                    return constants.genders[gender.alternative].weekendLabel;
                }
                return gender.weekendLabel;
            }
        }])
        .config(function ($routeProvider, $locationProvider) {
            $routeProvider
                .when('/login', {
                    templateUrl: '/partials/login.html'
                })
                .when('/admin', secure({
                    templateUrl: '/partials/admin.html',
                    controller: 'adminCtrl',
                    controllerAs: '$ctrl'
                }))
                .when('/weekend/:gender', secure({
                    templateUrl: '/partials/weekend.html',
                    controller: 'weekendCtrl',
                    controllerAs: '$ctrl'
                }))
                .when('/pescadores', secure({
                    templateUrl: '/partials/pescadores.html',
                    controller: 'pescadoresCtrl',
                    controllerAs: '$ctrl'
                }))
                .when('/pescadores/:_id', secure({
                    templateUrl: '/partials/pescadore.html',
                    controller: 'pescadoreCtrl',
                    controllerAs: '$ctrl'
                }))
                .when('/candidates/:gender', secure({
                    templateUrl: '/partials/candidates.html',
                    controller: 'candidatesCtrl',
                    controllerAs: '$ctrl'
                }))
                .otherwise({
                    templateUrl: '/partials/home.html'
                });

            function secure(route) {
                return angular.extend({}, route, {
                    resolveRedirectTo: ['authSvc', function (authSvc) {
                        if (!authSvc.isAuthenticated()) {
                            return '/login';
                        }
                    }]
                });
            }
        });
    angular.bootstrap(document, ['btd']);
});
