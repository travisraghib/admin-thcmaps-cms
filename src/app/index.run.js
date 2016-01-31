export function runBlock($rootScope, $state, authDataService, _) {
    'ngInject';
    $rootScope.$on('$stateChangeStart', function(event, next) { //eslint-disable-line no-use-before-define
        if(!next.authenticate) {
            return;
        }

        if(angular.isString(next.authenticate)) {
            auth.hasRole(next.authenticate, _.noop).then(has => {
                if(has) {
                    return;
                }

                event.preventDefault();
                return auth.isLoggedIn(_.noop).then(is => {
                    $state.go(is ? 'main' : 'login');
                });
            });
        } else {
            auth.isLoggedIn(_.noop).then(is => {
                if(is) {
                    return;
                }

                event.preventDefault();
                $state.go('main');
            });
        }
    });
}
