export class SelectController {
    constructor($log, $state, vendorDataService, vendorList, _) {
        'ngInject';
        //debug
        this.log = $log.log;
        this.error = $log.error;

        //deps
        this._ = _;
        this.$state = $state;
        this.vendorDataService = vendorDataService;


        //view template data
        this.vendorList = vendorList;
    }

    //create new business
    addBusiness(){
        this.vendorDataService.addBusiness()
            .then(data=>{
                let _id = data._id;
                this.vendorList.unshift({_id});
            })
            .catch(error =>{
                this.log(error);
                //this.$state.go('login')
            })
    }

    //delete existing business
    deleteBusiness(id) {
        this.vendorDataService.deleteBusiness(id)
            .then(() => {
                this._.forEach(this.vendorList, (vendor, index )=>{
                    if(vendor._id === id){
                        this.vendorList.splice(index, 1);
                        return false;
                    }
                });
            })
            .catch((error) => {
                this.log(error);
            })
    }
}
