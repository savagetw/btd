define([], function () {
    return [
        '$resource',
        '$rootScope',
        '$location',
        '$timeout',
        authSvc
        ];

    // The server maintains injects a session id cookie and maintains
    // its own authentication status of the session. The client can
    // authenticate by posting to /auth. Once authed, the server will
    // respond to a get of /auth with HTTP 200.
    function authSvc(
        $resource,
        $rootScope,
        $location,
        $timeout
        ) {
        var Auth = $resource('/auth');
        var svc = this;
        var authed = false;
        
        svc.login = login;
        svc.verifyAuthentication = verifyAuthentication;

        function login(username, password) {
            return Auth.save({}, {
                username: username,
                password: btoa(password)
            }).$promise.then(verifyAuthentication);
        };

        var verifyAttempt;
        function verifyAuthentication() {
            if (verifyAttempt) {
                $timeout.cancel(verifyAttempt);
            }

            return Auth.get().$promise.then(function () {
                verifyAttempt = $timeout(reauth, 5000);
            });
        }

        // Once successfully authenticated, verify that the 
        // server hasn't discarded the session.
        function reauth() {
            svc.verifyAuthentication().catch(function (e) {
                $location.url('/login');
            });
        }
    }
});