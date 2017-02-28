define([], function () {
    return ['$resource', 'currentWeekendSvc', function ($resource, currentWeekend) {
        var Admin = $resource('/admin');
        let ctrl = this;

        this.admin = Admin.get();

        this.addWeekend = function (weekendNumber) {
            Admin.save({
                command: 'weekend.add',
                weekendNumber: ++ctrl.admin.meta.currentWeekendNumber
            });
        };

        this.setCurrent = function (weekendNumber) {
            Admin.save({
                command: 'weekend.setCurrent',
                weekendNumber: ctrl.admin.meta.currentWeekendNumber
            }).$promise.then(function () {
                return currentWeekend.reloadWeekends();
            });
        };
    }];
})