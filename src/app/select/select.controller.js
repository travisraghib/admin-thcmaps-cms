export class SelectController {
    constructor($log, vendorDataService) {
        'ngInject';
        //debug
        this.log = $log.log;
        this.error = $log.error;

        //deps
        this.vendorDataService = vendorDataService;

        //template data
        this.business = this.vendorDataService.business;
    }

    addBusiness(){
        this.log(16);
        this.vendorDataService.addBusiness()
            .$promise
            .then(function(res){
                this.log(res);
            });
    }
}
