define([], function () {
    return ['$route', '$resource', function ($route, $resource) {
        var Attendee = $resource('/weekend/:gender/:weekendNumber/attendee/:personId');
        var Roles = $resource('/roles');
        var Weekends = $resource('/weekend/:gender/:weekendNumber');
        var gender = $route.current.params.gender;

        var weekendNumber = $route.current.params.weekendNumber;
        
        // Define interface for partials
        var $ctrl = this;
        $ctrl.remove = remove;
        $ctrl.changeRole = changeRole;
        $ctrl.roles = Roles.query({
            assignable: true
        });

        fetchWeekend();

        function fetchWeekend() {
            return Weekends.get({
                gender: gender,
                weekendNumber: weekendNumber
            }).$promise.then(function (weekend) {
                $ctrl.weekend = weekend;
            });
        }

        function remove(attendee) {
            return Attendee.delete({
                gender: gender,
                weekendNumber: weekendNumber,
                personId: attendee.person._id
            }).$promise.then(fetchWeekend);
        };

        function changeRole(attendee) {
            currentWeekend.addTeamMember(gender, attendee.person._id, attendee.role._id);
        }

        function changeRole(attendee) {
            let params = {
                gender: gender,
                weekendNumber: weekendNumber,
                personId: attendee.person._id
            };
            let payload = attendee.role._id ? {_id: attendee.role._id} : {};
            return Attendee.save(params, payload).$promise
                .then(fetchWeekend);
        };
    }];
})