export class vendorDataService {
    constructor($log, $http, $resource) {
        'ngInject';

        this.log = $log.log;
        this.error = $log.error;
        this.vendorResource = $resource('api/vendor/:vendor');
        this.vendorUpdateResource = $resource('api/vendor/:vendor', null, {update: {method: 'PUT'}});

        this.menuResource = $resource('api/menu/:vendor/:itemId');
        this.menuUpdateResource = $resource('api/menu/:vendor', null, {update: {method: 'PUT'}});
    }

    //update menu data
    updateMenu(vendor, data) {
        data.time = new Date();
        return this.menuUpdateResource.update({vendor: vendor}, data);
    }

    //update vendor data
    updateVendor(vendor, data) {
        data.time = new Date();
        return this.vendorUpdateResource.update({vendor: vendor}, data);
    }

    //get vendor data
    getVendor(vendor) {
        return this.vendorResource.get({vendor: vendor}).$promise
            .then((response) => {
                this.data = response;
                return response;
            })
            .catch((error) => {
                this.error('XHR Failed for getContributors.\n' + angular.toJson(error.data, true));
            });
    }
}

