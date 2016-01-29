export class authDataService {
    constructor($log, $http, $q, tokenService) {
        'ngInject';

        //debug
        this.log = $log.log;
        this.error = $log.error;

        //dependancies
        this.$http = $http;
        this.$q = $q;
        this.tokenService = tokenService;

        //local
        this.authUrl = 'auth/local';
        this.createUrl = 'api/user';
        this.jwt = '';

    }

    //existing account login
    loginAccount (data) {
        let defer = this.$q.defer();

        this.$http.post(this.authUrl, data)
            .then((res)=>{
                this.log(res);
                this.setJwt(res.data);
                defer.resolve(res.data);
            },(error)=>{
                defer.reject(error);
            });

        return defer.promise;
    }
    //new account create
    createNewAccount (data) {
        let defer = this.$q.defer();

        this.$http.post(this.createUrl, data)
            .then((res)=>{
                this.setJwt(res.data);
                defer.resolve(res.data);
            },(error)=>{
                defer.reject(error);
            });

        return defer.promise;
    }

    setJwt(data){
        this.jwt = data;
        this.tokenService.setToken(data);
    }
}

