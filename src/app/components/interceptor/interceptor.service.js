export class interceptorService {
    constructor(tokenService){
        'ngInject';
        //deps
        this.tokenService = tokenService;
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
