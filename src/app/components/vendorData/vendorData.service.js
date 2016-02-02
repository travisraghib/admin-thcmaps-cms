export class vendorDataService {
    constructor($log, $resource, $q, sessionStorageService) {
        'ngInject';

        //debug
        this.log = $log.log;
        this.error = $log.error;

        //deps
        this.$q = $q;
        this.sessionStorageService = sessionStorageService;

        //resources
        this.vendorResource = $resource('api/vendor/:vendor');
        this.vendorUpdateResource = $resource('api/vendor/:vendor', null, {update: {method: 'PUT'}});

        this.menuResource = $resource('api/vendor/menu/:vendor/:itemId');
        this.menuUpdateResource = $resource('api/vendor/menu/:vendor', null, {update: {method: 'PUT'}});

        this.businessResource = $resource('api/user/business/:id');

        this.business = this.getBusiness();
    }
    //get cached business array
    getVendorList (){
        let vendorList = this.sessionStorageService.getData('business');

        if(!vendorList.length) {
            return [];
        }

        return this.vendorResource.query({vendorList}).$promise
            .then(data => {
                console.log(data);
                return data;
            })
            .catch((error) => {
                this.error('XHR Failed for getVendorList.\n' + angular.toJson(error.data, true));
                return error;
            });

    }

    //cache business array
    setBusiness (data){
        this.sessionStorageService.setData('business', data);
        this.business = data;
    }

    //get cached business array
    getBusiness (data){
        return this.sessionStorageService.getData('business') || [];
    }

    //add a business method
    addBusiness (){
        return this.businessResource.save().$promise
            .then(res =>{
                this.business.unshift(res._id);
                this.setBusiness(this.business);
                return res;
            })
            .catch(error => {
                console.log(error);
            });
    }

    deleteBusiness(id){
        if(!id){
            return;
        }

        let userPromise = this.businessResource.delete({id}).$promise,
            vendorPromise = this.vendorResource.delete({vendor : id}).$promise,
            defer = this.$q.defer();
        this.$q.all([userPromise, vendorPromise])
            .then(data =>{
                defer.resolve(data[0].business);
            })
            .catch(error =>{
                defer.reject(error);
            });

        return defer.promise;

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
                this.error('XHR Failed for getVendor.\n' + angular.toJson(error.data, true));
                return error;
            });
    }
}

