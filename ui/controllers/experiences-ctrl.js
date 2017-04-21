define([], function () {
    return ['$resource', function ($resource) {
        var $ctrl = this;
        var Roles = $resource('/roles');
        var Experiences = $resource('/people/experiences/:id');

        $ctrl.getExperiences = getExperiences;

        $ctrl.roles = Roles.query({assignable: 'true'});

        function getExperiences() {
            if (!$ctrl.role) {
                return;
            }
            $ctrl.people = Experiences.query({id: $ctrl.role._id});
        }
    }];
})