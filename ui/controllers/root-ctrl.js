define([], function () {
    return ['$scope', '$auth', '$resource', function ($scope, $auth, $resource) {
        $scope.welcome = 'oh yeah';

        $scope.user = {
            email: '',
            password: ''
        };

        $scope.isNavCollapsed = true;
        $scope.isCollapsed = false;
        $scope.isCollapsedHorizontal = false;

        $scope.login = function () {
            $auth.login($scope.user)
                .then(function () {
                    console.log('Dance!');
                })
                .catch(function () {
                    console.log('Do not dance.');
                });
        };
    }];
})