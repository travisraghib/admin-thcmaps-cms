export function MenuTabDirective() {
    'ngInject';

    let directive = {
        restrict        : 'E',
        templateUrl     : 'app/components/menuTab/menutab.html',
        controller      : MenutabController,
        controllerAs    : 'menu',
        bindToController: {
            data    : '=',
            template: '='
        }
    };
    return directive;
}

class MenutabController {
    constructor($scope, $rootScope, $log, $stateParams, vendorDataService) {
        'ngInject';

        this.log = $log.log;
        this.vendorDataService = vendorDataService;
        this.id = $stateParams.id;

        this.log(vendorDataService);
        $scope.$on('update:menu', this.handleItemUpdate(this))
    }

    //update ng-repeat data
    handleItemUpdate(that) {
        return function(event, data) {
            that.data = data.menu
        }
    }

    //delete menu item
    deleteItem(id) {
        this.vendorDataService.menuResource.delete({vendor: this.id, itemId: id})
            .$promise
            .then((data) => {
                this.log(data);
                this.data = data.menu;
            })
            .catch((error) => {
                this.log(error);
            });

    }
}
