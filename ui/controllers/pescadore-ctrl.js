define([], function () {
    return [
        '$resource',
        '$route',
        'currentWeekendSvc',
        'btdConstants',
        function (
            $resource, 
            $route, 
            currentWeekend, 
            constants) {

            let $ctrl = this;
            $ctrl.isAlreadyWorking = isAlreadyWorking;
            $ctrl.addToCurrentWeekend = addToCurrentWeekend;

            let Person = $resource('/people/:_id');
            let working = {
                male: true,
                female: true
            };
            load();

            function load() {
                $ctrl.person = Person.get($route.current.params);
                $ctrl.person.$promise.then(function (person) {
                    currentWeekend.isTeamMember(person.gender, person._id)
                        .then(function (isAlreadyWorking) {
                            working[person.gender] = isAlreadyWorking;
                        });

                    let alternativeGender = getGender(true);
                    currentWeekend.isTeamMember(alternativeGender, person._id)
                        .then(function (isAlreadyWorking) {
                            working[alternativeGender] = isAlreadyWorking;
                        });
                });
            }

            function isAlreadyWorking(isAlternative) {
                if (!$ctrl.person.gender) {
                    return false;
                }
                return working[getGender(isAlternative)];
            }

            function addToCurrentWeekend(isAlternative) {
                currentWeekend.addTeamMember(getGender(isAlternative), $ctrl.person._id)
                    .then(function () {
                        load();
                    });
            }

            function getGender(isAlternative) {
                return isAlternative ?
                    constants.genders[$ctrl.person.gender].alternative :
                    $ctrl.person.gender;
            }
        }
    ];
})