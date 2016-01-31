export class vendorDataService {
    constructor($log, $resource, sessionStorageService) {
        'ngInject';

        //debug
        this.log = $log.log;
        this.error = $log.error;

        //deps
        this.sessionStorageService = sessionStorageService;

        //resources
        this.vendorResource = $resource('api/vendor/:vendor');
        this.vendorUpdateResource = $resource('api/vendor/:vendor', null, {update: {method: 'PUT'}});

        this.menuResource = $resource('api/vendor/menu/:vendor/:itemId');
        this.menuUpdateResource = $resource('api/vendor/menu/:vendor', null, {update: {method: 'PUT'}});

        this.businessResource = $resource('api/user/business');

        this.business = this.getBusiness();
    }

    //cache business array
    setBusiness (data){
        this.sessionStorageService.setData('business', data);
        this.business = data;
    }

    //get cached business array
    getBusiness (){
        return this.sessionStorageService.getData('business') || [];
    }

    addBusiness (){
        let data = {
            time : new Date()
        };

        return this.businessResource.save(data);
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

