define([], function () {
    return ['$resource', '$route', function ($resource, $route) {
        var Weekend = $resource('/weekend/:gender');
        this.weekend = Weekend.get($route.current.params);
    }];
})