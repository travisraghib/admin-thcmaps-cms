export class authDataService {
    constructor($log, $http, $resource, $q, $state, $cookies, tokenService, vendorDataService) {
        'ngInject';

        //debug
        this.log = $log.log;
        this.error = $log.error;

        //dependancies
        this.$http = $http;
        this.$q = $q;
        this.$state = $state;
        this.$cookies = $cookies;
        this.tokenService = tokenService;
        this.vendorDataService = vendorDataService;

        //local
        this.authUrl = 'auth/local';
        this.createUrl = 'api/user';
        this.business = vendorDataService.business;
    }

    //auth status
    authStatus(){
        return this.$cookies.get('token');
    }

    //existing account login
    loginAccount(data) {
        let defer = this.$q.defer();

        this.$http.post(this.authUrl, data)
            .then((res)=> {
                this.handleSuccess(defer, res);
            }, (error)=> {
                defer.reject(error);
            });

        return defer.promise;
    }

    //new account create
    createNewAccount(data) {
        let defer = this.$q.defer();

        this.$http.post(this.createUrl, data)
            .then((res)=> {
                this.handleSuccess(defer, res);
            }, (error)=> {
                defer.reject(error);
            });

        return defer.promise;
    }

    //handle successfull account create or login
    handleSuccess(defer, res) {
        let token = res.data.token,
            business = res.data.business;

        this.setJwt(token);
        this.setBusiness(business);
        this.$cookies.put('token', token);
        this.next();

        defer.resolve(res.data);
    }

    //set jwt data for headers
    setJwt(data) {
        this.jwt = data;
        this.tokenService.setToken(data);
    }

    //set business array for business list
    setBusiness(data) {
        this.business = data;
        this.vendorDataService.setBusiness(data);
    }

    //goto select page
    next() {
        this.$state.go('select');
    }
}

