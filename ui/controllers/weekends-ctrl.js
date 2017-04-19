define([], function () {
    return ['$route', '$resource', 'currentWeekendSvc', function ($route, $resource, currentWeekend) {
        var $ctrl = this;
        $ctrl.gender = $route.current.params.gender.toLowerCase();
        $ctrl.weekends = $resource('/weekend/:gender').query({
            gender: $ctrl.gender 
        });
    }];
})