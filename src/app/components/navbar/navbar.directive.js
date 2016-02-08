export function NavbarDirective() {
    'ngInject';

    let directive = {
        restrict        : 'E',
        templateUrl     : 'app/components/navbar/navbar.html',
        scope           : {
            creationDate: '='
        },
        controller      : NavbarController,
        controllerAs    : 'nav',
        bindToController: true
    };

    return directive;
}

class NavbarController {
    constructor(authDataService){
        'ngInject';

        this.authDataService = authDataService;
        this.authStatus = !!authDataService.authStatus();
    }
    logOut(){
        this.authDataService.logOut();
    }
}
