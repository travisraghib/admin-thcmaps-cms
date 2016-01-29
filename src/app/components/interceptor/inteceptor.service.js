export class interceptorService {
    constructor(tokenService){
        'ngInject';
        //dependancies
        this.tokenService = tokenService;
        console.log(tokenService)
    }

    generateInterceptor() {
        let tokenService = this.tokenService;
        return {
            request: function(config) {
                config.headers.token = tokenService.getToken();
                return config;
            }
        };
    }
}
