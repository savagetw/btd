define([], function () {
    return ['$route', '$resource', 'currentWeekendSvc', function ($route, $resource, currentWeekend) {
        var Roles = $resource('/roles');
        var gender = $route.current.params.gender;
        
        // Define interface for partials
        var $ctrl = this;
        $ctrl.remove = remove;
        $ctrl.changeRole = changeRole;
        $ctrl.roles = Roles.query({
            assignable: true
        });
        
        // Initialize
        getWeekend();

        function getWeekend() {
            $ctrl.weekend = currentWeekend.get(gender);
        }
        
        function remove(attendee) {
            currentWeekend.remove(gender, attendee)
                .then(currentWeekend.reloadWeekends)
                .then(getWeekend);
        }

        function changeRole(attendee) {
            currentWeekend.addTeamMember(gender, attendee.person._id, attendee.role._id);
        }
    }];
})