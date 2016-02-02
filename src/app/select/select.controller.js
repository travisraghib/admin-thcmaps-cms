export class SelectController {
    constructor($log, $state, vendorDataService, vendorList, _) {
        'ngInject';
        //debug
        this.log = $log.log;
        this.error = $log.error;

        //deps
        this.$state = $state;
        this.vendorDataService = vendorDataService;

        //view template data
        this.vendorList = vendorList;
        console.log(vendorList);
    }

    //create new business
    addBusiness(){
        this.vendorDataService.addBusiness()
            .then(data=>{
                let _id = data._id;
                this.vendorList.unshift({_id});
            })
            .catch(err =>{
                //this.$state.go('login')
            })
    }

    //delete existing business
    deleteBusiness(id) {
        this.log(id);
        this.vendorDataService.deleteBusiness(id)
            .then(data => {
                _.forEach(this.vendorList, (vendor, index )=>{
                    this.log(vendor);
                    if(vendor._id === id){
                        this.vendorList.splice(index, 1);
                        return false;
                    }
                })
            })
    }
}
