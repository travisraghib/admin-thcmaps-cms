export class vendorDataService {
    constructor($log, $resource, $q, sessionStorageService, _) {
        'ngInject';

        //debug
        this.log = $log.log;
        this.error = $log.error;

        //deps
        this._ = _;
        this.$q = $q;
        this.sessionStorageService = sessionStorageService;

        //resources
        this.uniqueStatusResource = $resource('api/service/unique/:slug');
        this.vendorResource = $resource('api/vendor/:vendor');
        this.vendorUpdateResource = $resource('api/vendor/:vendor', null, {update: {method: 'PUT'}});

        this.menuResource = $resource('api/vendor/menu/:vendor/:itemId');
        this.menuUpdateResource = $resource('api/vendor/menu/:vendor', null, {update: {method: 'PUT'}});

        this.businessResource = $resource('api/user/business/:id');

        this.business = this.getBusiness();
    }
    //check status of given url
    getUniqueStatus(slug){
        return this.uniqueStatusResource.get({slug}).$promise
    }

    //get cached business array
    getVendorList (){
        return this.businessResource.get().$promise
            .then(data=>{
                let vendorList = data.business;

                if(!vendorList){
                    return [];
                }

                return this.vendorResource.query({vendorList}).$promise
                    .then(data => {
                        return data;
                    })
                    .catch((error) => {
                        this.error('XHR Failed for getVendorList.\n' + angular.toJson(error.data, true));
                        return error;
                    });
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
    getBusiness (){
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
                this.log(error);
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

