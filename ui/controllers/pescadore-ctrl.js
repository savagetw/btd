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

            let Person = $resource('/people/:id');
            let working = {
                male: true,
                female: true
            };
            load();

            function load() {
                $ctrl.person = Person.get($route.current.params);
                $ctrl.person.$promise.then(function (person) {
                    if (person.experiences) {
                        person.groupedExperiences = person.experiences.reduce(function (groupedBy, experience) {
                            var role = experience.role.title;
                            groupedBy[role] = groupedBy[role] || [];
                            groupedBy[role].push(experience);
                            return groupedBy;
                        }, {});
                    }

                    // Show "add to team" buttons for either gender weekend
                    currentWeekend.isTeamMember(person.gender, person._id)
                        .then(function (isAlreadyWorking) {
                            working[person.gender] = isAlreadyWorking;
                        });

                    let alternativeGender = getGender(true);
                    currentWeekend.isTeamMember(alternativeGender, person._id)
                        .then(function (isAlreadyWorking) {
                            working[alternativeGender] = isAlreadyWorking;
                        });

                    person.candidatesSponsored = Person.query({sponsoredBy: person._id});

                    assignPrintableAddress(person);
                });
            }

            function assignPrintableAddress(person) {
                if (!person.address || !person.address.city || !person.address.state) {
                    person.addressLines = ['Unknown'];
                }
                let fullCity = person.address.city + ', ' + person.address.state;
                if (!person.address.street || !person.address.zip) {
                    person.addressLines = [fullCity];
                }
                return person.addressLines = [person.address.street, fullCity + ' ' + person.address.zip];
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