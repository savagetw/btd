define([], function () {
    return ['$resource', '$rootScope', '$location', '$timeout', function authSvc($resource, $rootScope, $location, $timeout) {
        var Auth = $resource('/auth');
        var authed = false;

        this.login = function (username, password) {
            return Auth.save({}, {
                username: username,
                password: password
            }).$promise.then(verifyAuth);
        };

        this.isAuthenticated = function () {
            return authed;
        }

        var verifyAttempt;
        function verifyAuth() {
            if (verifyAttempt) {
                $timeout.cancel(verifyAttempt);
            }

            return Auth.get().$promise.then(function () {
                authed = true;
                verifyAttempt = $timeout(verifyAuth, 5000);
                return authed;
            }).catch(function () {
                authed = false;
                $location.url('/login');
            });
        }
    }];
})