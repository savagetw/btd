define([], function () {
    return ['$resource', '$route', function ($resource, $route) {
        let $ctrl = this;
        let Person = $resource('/people/:_id');
        $ctrl.person = Person.get($route.current.params);
    }];
})