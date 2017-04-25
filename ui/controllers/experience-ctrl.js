define([], function () {
    return ['$resource', '$route', '$q', function ($resource, $route, $q) {
        var $ctrl = this;
        $q.all([
            $resource('/roles/:id').get($route.current.params).$promise,
            $resource('/people/experiences/:id').query($route.current.params).$promise
        ]).then(_.spread(function (role, experiences) {
            console.log('Rolled!');
            $ctrl.role = role;
            $ctrl.experiences = experiences;
        }));
    }];
})