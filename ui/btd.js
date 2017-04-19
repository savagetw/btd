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
    'controllers/weekend-edit-ctrl',
    'controllers/weekends-ctrl',
    'controllers/pescadores-ctrl',
    'controllers/pescadore-ctrl',
    'controllers/candidates-ctrl',
    'controllers/admin-ctrl',
    'filters/pescadore-filters',
    'services/auth-svc',
    'services/current-weekend-svc'
], function (
    ng, 
    ngRoute, 
    ngResource, 
    satellizer, 
    bootstrap, 
    rootCtrl, 
    weekendEditCtrl, 
    weekendsCtrl, 
    pescadoresCtrl, 
    pescadoreCtrl, 
    candidatesCtrl, 
    adminCtrl,
    pescadoreFilters,
    authSvc,
    currentWeekendSvc
    ) {
    
    var btd = angular
        .module('btd', ['ngRoute', 'ngResource', 'satellizer', 'ui.bootstrap'])
        .controller('rootCtrl', rootCtrl)
        .controller('weekendEditCtrl', weekendEditCtrl)
        .controller('weekendsCtrl', weekendsCtrl)
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
                    templateUrl: '/partials/weekends.html',
                    controller: 'weekendsCtrl',
                    controllerAs: '$ctrl'
                }))
                .when('/weekend/:gender/:weekendNumber', secure({
                    templateUrl: '/partials/weekend-edit.html',
                    controller: 'weekendEditCtrl',
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
                        return authSvc.verifyAuthentication().catch(function () {
                            return '/login';
                        });
                    }]
                });
            }
        });

    pescadoreFilters.forEach(function (pescadoreFilter) {
        btd.filter(pescadoreFilter.name, pescadoreFilter.filter);
    });

    angular.bootstrap(document, ['btd']);
});
