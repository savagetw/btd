define([], function () {
    return ['$resource', function currentWeekendSvc($resource) {
        var Weekend = $resource('/weekend/:gender');
        var Attendee = $resource('/weekend/:gender/:weekendNumber/attendee/:personId');
        var weekends = {};

        var $svc = this;
        
        this.reloadWeekends = function () {
            ['male', 'female'].forEach(function (gender) {
                weekends[gender] = Weekend.get({gender: gender, current: true});
            });
        };

        this.reloadWeekends();

        this.get = function (gender) {  
            return weekends[gender];
        };

        this.isTeamMember = function (gender, id) {
            console.log('Is already working?', gender, id);
            var weekend = weekends[gender];
            return weekend.$promise.then(function () {
                for(let i = 0; i < weekend.attendees.length; i++) {
                    if (id === weekend.attendees[i].person._id) {
                        console.log('Yep, I see attendee in current weekdn1');
                        return true;
                    }
                }
                return false;
            });
        };

        this.addTeamMember = function (gender, personId, roleId) {
            var weekend = weekends[gender];
            let params = {
                gender: weekend.gender,
                weekendNumber: weekend.weekendNumber,
                personId: personId
            };
            let payload = roleId ? {_id: roleId} : {};
            return Attendee.save(params, payload).$promise
                .then($svc.reloadWeekends);
        };

        this.remove = function (gender, attendee) {
            var weekend = weekends[gender];
            return Attendee.delete({
                gender: weekend.gender,
                weekendNumber: weekend.weekendNumber,
                personId: attendee.person._id
            }).$promise.then($svc.reloadWeekends);
        };
    }];
})