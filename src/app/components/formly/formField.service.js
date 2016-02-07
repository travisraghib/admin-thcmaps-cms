export class formFieldService {
    constructor(vendorDataService, constants, _) {
        'ngInject';

        //deps
        this.vendorDataService = vendorDataService;
        this._ = _;
        this.states = constants.states;
    }

    //slug form field
    slugFormField () {
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

    //name form field
    nameFormField () {
        return [{
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
    }

    //address form field
    addressFormField () {
        let _ = this._,
            states = this.states;

        return [
            {
                key            : 'address',
                type           : 'input',
                templateOptions: {
                    label   : 'Address',
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
                    label   : 'City',
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
                    label   : 'State',
                    requried: true,
                    options : function() {
                        let arr = [];
                        _.each(states, (state, code)=> {
                            arr.push({name: code, value: code});
                        })
                        return arr;
                    }()
                }
            },
            {
                key            : 'zip_code',
                type           : 'input',
                templateOptions: {
                    label   : 'Zip Code',
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
                    label   : 'Phone Number',
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

    //login form field
    loginFormField(){
        return [{
            key : 'email',
            type : 'input',
            templateOptions : {
                label: 'Email Address',
                required: true,
                type: 'email'
            }

        },
        {
            key : 'password',
            type : 'input',
            templateOptions : {
                label: 'Password',
                required: true,
                type : 'password'
            }
        }]
    }

    //new account form field
    createFormField(){
        return [
            //name field
            {
                key : 'name',
                type : 'input',
                templateOptions : {
                    label: 'Name',
                    required: true
                },

                validators     : {
                    alpha: ($viewValue, $modelValue) => {
                        let value = $modelValue || $viewValue;
                        if(value.length > 1 && value.length < 60) {
                            return /^[a-zA-Z ]*$/.test(value);
                        } else {
                            return false;
                        }
                    }
                }
            },
            //name error msg
            {
                template: '<p class="text-danger"> Please enter a valid name</p>',
                hideExpression: function($viewValue, $modelValue, scope) {
                    let error = scope.theFormlyForm.$error.alpha;
                    return (error && error[0].$dirty) ? false : true;
                }

            },
            //email field
            {
                key : 'email',
                type : 'input',
                templateOptions : {
                    label: 'Email Address',
                    required: true,
                    type: 'email'
                }

            },
            //email error message
            {
                template: '<p class="text-danger"> Please enter a valid Email address {{$modelValue |json}}</p>',
                hideExpression: function($viewValue, $modelValue, scope) {
                    return !scope.theFormlyForm.$error.email;
                }

            },
            {
                key : 'password',
                type : 'input',
                templateOptions : {
                    label: 'Password',
                    required: true,
                    type : 'password',
                    minlength: 5
                }
            },
            {
                template: '<p class="text-danger"> Please enter a valid password</p>',
                hideExpression: function($viewValue, $modelValue, scope) {
                    return !scope.theFormlyForm.$error.minlength;;
                }

            }
        ];
    }
}
