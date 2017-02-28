define([], function () {
    return ['$resource', '$route', function ($resource, $route) {
        let $ctrl = this;
        let Candidates = $resource('/candidates/:gender');
        $ctrl.candidates = Candidates.query($route.current.params);
    }];
})