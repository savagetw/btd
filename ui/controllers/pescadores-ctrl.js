define([], function () {
    return ['$resource', function ($resource) {
        let $ctrl = this;
        this.people = [];

        let Person = $resource('/people');

        this.query = '';
        $ctrl.changed = _.debounce(function (query) {
            if (query.length <= 3) {
                return;
            }

            $ctrl.people = Person.query({
                q: query
            });
        }, 500);
    }];
})