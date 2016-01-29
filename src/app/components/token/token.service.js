export class tokenService {
    constructor(sessionStorageService){
        'ngInject';
        this.sessionStorageService = sessionStorageService;
    }
    //store session token
    setToken (token) {
        this.sessionStorageService.setData('token', token);
    }

    //return session token
    getToken(){
        return this.sessionStorageService.getData('token') || undefined;
    }
}
