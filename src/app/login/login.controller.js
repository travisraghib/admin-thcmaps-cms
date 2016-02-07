export class LoginController {
    constructor($log, authDataService, sessionStorageService, formFieldService) {
        'ngInject';
        //debug
        this.log = $log.log;
        this.error = $log.error;

        //dependancies
        this.authDataService = authDataService;
        this.sessionStorageService = sessionStorageService;
        //form data
        this.model = {
            name : '',
            email   : '',
            password: ''
        };

        this.loginFormField = formFieldService.loginFormField();
        this.createFormField = formFieldService.createFormField();
    }

    //create ui interaction
    create () {
        let data = angular.copy(this.model);

        this.authDataService.createNewAccount(data)
            .then((res)=>{
                this.log(res);
            }, (error)=>{
                this.log(error)
            });
    }

    //login ui interaction
    login () {
        let data = angular.copy(this.model);

        this.authDataService.loginAccount(data)
        .then((res)=>{
            this.log(res);
        }, ()=>{
            this.invalidCredentials = true;
        });
    }

}
