export function runBlock($rootScope, $state, authDataService, _) {
    'ngInject';

    $rootScope.$on('$stateChangeStart', (event, next) => {

        //handle proper routing based on login state
        let authStatus = authDataService.authStatus();

        //go to select page if if user goes to login page after beign loged in
        if(next.name === 'login' && authStatus){
            event.preventDefault();
            $state.go('select');
        }

        //go to login page if session expires
        if(next.name !== 'login' && !authStatus){
            event.preventDefault();
            $state.go('login');
        }
    });

}
