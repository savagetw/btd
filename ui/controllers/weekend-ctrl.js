define([], function () {
    return ['$route', 'currentWeekendSvc', function ($route, currentWeekend) {
        this.weekend = currentWeekend.get($route.current.params.gender);
    }];
})