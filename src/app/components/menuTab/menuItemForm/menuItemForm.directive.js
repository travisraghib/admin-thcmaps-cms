export function MenuItemFormDirective() {
    'ngInject';

    let directive = {
        restrict        : 'E',
        templateUrl     : 'app/components/menuTab/menuItemForm/menuItemForm.html',
        controller      : MenuItemFormController,
        controllerAs    : 'menuForm',
        bindToController: {
            model: '=',
            label: '='
        }
    };

    return directive;
}

class MenuItemFormController {
    constructor($log, $stateParams, $rootScope, Upload, vendorDataService) {
        'ngInject';
        //debug
        this.log = $log.log;

        //dependancies
        this.upload = Upload;
        this.id = $stateParams.id;
        this.vendorDataService = vendorDataService;
        this.$rootScope = $rootScope;

        this.backUpData = angular.copy(this.model);
        this.show = false;
        this.file = null;
        this.error = null;


    }
    //hide form
    cancel() {
        this.show = false;
        this.model = angular.copy(this.backUpData);
    }

    //save and submit form
    saveImage () {
        if(this.file){
            return this.upload.upload({
                url   : '/api/image/' + this.id,
                data  : {file: this.file},
                method: 'PUT'
            }).then((response) => {
                //success
                this.log(response);
                this.model.image_url = response.data;
                this.saveItem();
            }, (response) => {
                //error
                this.log(response);
                if(response.status > 0) {
                    this.avatarErrorMsg = response.status + ': ' + response.data;
                    this.uploadingAvatar = false;
                    this.avatarProgress = 0;
                }
            }, (evt)=> {
                //on data
                this.avatarProgress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
            });
        }
        this.saveItem();
    }
    saveItem () {
        let item = this.model;
        this.vendorDataService.updateMenu(this.id, item)
            .$promise
            .then((data) => {
                this.log(data);
                this.show = false;
                this.$rootScope.$broadcast('update:menu', data);
            })
            .catch((error) => {
                this.log(error);
            });
    }

    //handle image file select
    storeFile(file, error) {
        this.file = file;
        this.error = error;
    }
}
