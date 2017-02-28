define([], function () {
    return ['$resource', '$route', 'currentWeekendSvc', function ($resource, $route, currentWeekend) {
        let $ctrl = this;
        let Person = $resource('/people/:_id');

        $ctrl.isAlreadyWorking = true;

        $ctrl.reload = function () {
            $ctrl.person = Person.get($route.current.params);
            $ctrl.person.$promise.then(function (person) {
                currentWeekend.isTeamMember(person.gender, person._id)
                    .then(function (isAlreadyWorking) {
                        $ctrl.isAlreadyWorking = isAlreadyWorking;
                    });
            });
        }
        $ctrl.reload();

        $ctrl.addToCurrentWeekend = function () {
            currentWeekend.addTeamMember($ctrl.person)
                .then(function () {
                    $ctrl.reload();
                });
        }
    }];
})