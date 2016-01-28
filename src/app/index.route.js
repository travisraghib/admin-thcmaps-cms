export function routerConfig($stateProvider, $urlRouterProvider) {
    'ngInject';
    $stateProvider
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

    $urlRouterProvider.otherwise('/manage/deliverygreens-com-la-habra');



}
