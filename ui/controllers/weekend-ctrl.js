define([], function () {
    return ['$route', 'currentWeekendSvc', function ($route, currentWeekend) {
        
        var $ctrl = this;
        var gender = $route.current.params.gender;
        $ctrl.remove = remove;
        getWeekend(); 

        function getWeekend() {
            $ctrl.weekend = currentWeekend.get(gender);
        }
        
        function remove(attendee) {
            currentWeekend.remove(gender, attendee)
                .then(currentWeekend.reloadWeekends)
                .then(getWeekend);
        }
    }];
})