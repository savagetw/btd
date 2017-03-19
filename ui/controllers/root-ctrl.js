define([], function () {
    return ['$scope', '$resource', 'authSvc', '$location', function ($scope, $resource, authSvc, $location) {
        $scope.welcome = 'oh yeah';

        $scope.user = {
            email: '',
            password: ''
        };

        $scope.login = function (u, p) {
            return authSvc.login(u, p).then(function () {
                $location.url('/');
            });
        } 

        $scope.isNavCollapsed = true;
        $scope.isCollapsed = false;
        $scope.isCollapsedHorizontal = false;
    }];
})