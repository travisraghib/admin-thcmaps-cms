export function routerConfig($stateProvider, $urlRouterProvider) {
    'ngInject';
    $stateProvider
        .state('login', {
            url         : '/',
            templateUrl : 'app/login/login.html',
            controller  : 'LoginController',
            controllerAs: 'login'
        })
        .state('select', {
            url : '/select'
        })
        .state('main', {
            url         : '/manage/:id',
            templateUrl : 'app/main/main.html',
            controller  : 'MainController',
            controllerAs: 'main',
            resolve : {
                vendorData : ($stateParams,vendorDataService) =>{
                    return vendorDataService.getVendor($stateParams.id);
                }
            }
        });

    $urlRouterProvider.otherwise('/');



}
