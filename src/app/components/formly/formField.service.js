export class formFieldService{
    constructor (vendorDataService, constants, _){
        'ngInject';

        //deps
        this.vendorDataService = vendorDataService;
        this._ = _;
        this.states = constants.states;

        let states = constants.states;

        this.nameFormField = [{
            key            : 'name',
            type           : 'input',
            templateOptions: {
                label   : 'Vendor Name',
                requried: true
            },
            validators     : {
                alpha: ($viewValue, $modelValue) => {
                    let value = $modelValue || $viewValue;
                    if(value.length > 1 && value.length < 60) {
                        return /^[a-zA-Z ',-]*$/.test(value);
                    } else {
                        return false;
                    }
                }
            }
        }];
        this.addressFormField = [
            {
                key            : 'address',
                type           : 'input',
                templateOptions: {
                    label: 'Address',
                    requried: true
                },
                validators     : {
                    address: ($viewValue, $modelValue) => {
                        let value = $modelValue || $viewValue;
                        if(value.length > 1 && value.length < 150) {
                            return /^[a-z A-Z 0-9 .#,-]*$/.test(value);
                        } else {
                            return false;
                        }
                    }
                }
            },
            {
                key            : 'city',
                type           : 'input',
                templateOptions: {
                    label: 'City',
                    requried: true
                },
                validators     : {
                    city: ($viewValue, $modelValue) => {
                        let value = $modelValue || $viewValue;
                        if(value.length > 1 && value.length < 150) {
                            return /^[a-z A-Z]*$/.test(value);
                        } else {
                            return false;
                        }
                    }
                }

            },
            {
                key            : 'state',
                type           : 'select',
                templateOptions: {
                    label: 'State',
                    requried: true,
                    options: function(){
                        let arr = [];
                        _.each(states, (state, code)=>{
                            arr.push({name:code, value:code});
                        })
                        return arr;
                    }()
                }
            },
            {
                key            : 'zip_code',
                type           : 'input',
                templateOptions: {
                    label: 'Zip Code',
                    requried: true
                },
                validators     : {
                    zip: ($viewValue, $modelValue) => {
                        let value = $modelValue || $viewValue;
                        if(value.length === 5) {
                            return /^[0-9]*$/.test(value);
                        } else {
                            return false;
                        }
                    }
                }
            },
            {
                key            : 'phone_number',
                type           : 'input',
                templateOptions: {
                    label: 'Phone Number',
                    requried: true
                },
                validators     : {
                    phone: ($viewValue, $modelValue) => {
                        let value = $modelValue || $viewValue;
                        if(value.length === 10) {
                            return /^[0-9]*$/.test(value);
                        } else {
                            return false;
                        }
                    }
                }
            }


        ];

    }

    slugFormField (){
        return [{
            key            : '_slug',
            type           : 'input',
            templateOptions: {
                label   : 'Vendor Url',
                requried: true
            },
            modelOptions   : {
                updateOn: 'blur keydown',
                debounce: {
                    keydown: 300,
                    blur   : 0
                }
            },
            validators     : {
                url: ($viewValue, $modelValue) => {
                    let value = $modelValue || $viewValue;
                    if(value.length > 1 && value.length < 60) {
                        return /^[a-z 0-9_-]*$/.test(value);
                    } else {
                        return false;
                    }
                }
            },

            asyncValidators: {
                isUnique: ($viewValue, $modelValue) => {
                    let value = $modelValue || $viewValue;
                    return this.vendorDataService.getUniqueStatus(value);
                }
            }

        }];
    }
}
