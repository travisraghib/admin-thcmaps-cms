export class interceptorService {
    constructor($rootScope, $q, $cookies, $injector, $log) {
        'ngInject';
        //debug
        this.log = $log.log;

        //deps
        this.$rootScope = $rootScope;
        this.$q = $q;
        this.$cookies = $cookies;
        this.$injector = $injector;

        //private
        let state = null;

        // Add authorization token to headers
        this.request = function(config) {
            config.headers = config.headers || {};

            if($cookies.get('token')) {
                config.headers.Authorization = 'Bearer ' + $cookies.get('token');
            }

            return config;
        };

        // Intercept 401s and redirect you to login
        this.responseError = function(response) {
            if(response.status === 401) {
                (state || (state = $injector.get('$state'))).go('login');
                // remove any stale tokens
                $cookies.remove('token');
            }

            return $q.reject(response);
        };
    }
}
