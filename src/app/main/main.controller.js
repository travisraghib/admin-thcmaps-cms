export class MainController {
    constructor($log, $stateParams, $scope, $timeout, vendorData, vendorDataService, constants, _, moment, Upload, formFieldService, google, geocoderService) {
        'ngInject';

        var vendor = vendorData;

        //debug
        this.log = $log.log;
        this.error = $log.error;

        //deps
        this.geocoderService = geocoderService;
        this._ = _;
        this.vendorDataService = vendorDataService;
        this.Upload = Upload;
        this.id = $stateParams.id;
        this.moment = moment;
        this.timeout = $timeout;

        //view bound data
        this.vendor = vendor;
        this.type = vendor._type;
        this.menu = vendor.menu;
        this.hours = this.setUpHours();
        this.avatarProgress = 0;
        this.menuItemCategories = constants.menuItemCategories;
        this.menuItemTemplate = angular.copy(constants.menuItemTemplate);

        //revert and editing flags
        this.editing = '';
        this.addressRevertData = '';
        this.ammenitiesRevertData = '';
        this.hoursRevertData = '';
        this.slugRevertData = '';
        this.nameRevertData = '';

        //formly
        this.slugFormField = formFieldService.slugFormField();
        this.nameFormField = formFieldService.nameFormField;
        this.addressFormField = formFieldService.addressFormField;
    }

    //edit name
    editName() {
        this.editing = 'name';
        this.nameRevertData = this.vendor.name;
    }

    //cancel edit name
    cancelEditName() {
        this.vendor.name = this.nameRevertData;
        this.editing = '';
        this.nameRevertData = '';

    }

    //edit hours
    editHours(time, day) {
        if(this.hoursRevertData) {
            this.cancelEditHours();
        }

        this.hoursRevertData = angular.copy(day);
        day.closed = false;
        day.editing = day[time];
        day.when = time;
    }

    //handle cancel edit hours
    cancelEditHours() {
        let day = this.hoursRevertData;
        this.hours[day.day_order] = day;
        this.hoursRevertData = null;
    }

    //se    tup editable hours objects
    setUpHours() {
        this._.each(this.vendor.hours, (day) => {
            //handle no open or close times
            if(!day || !day.opening_time || !day.closing_time) {
                day.open = new Date();
                day.close = new Date();
                day.closed = true;
                return;
            }
            // create js time object from string
            let openPeriod   = day && day.opening_time && day.opening_time.split(':')[1].slice(2, 4),
                closePeriod  = day.closing_time.split(':')[1].slice(2, 4),
                openHour     = (openPeriod.toLowerCase() === 'pm') ? Number(day.opening_time.split(':')[0]) + 12 : day.opening_time.split(':')[0],
                openMinutes  = day.opening_time.split(':')[1].slice(0, 2),
                closeHour    = (closePeriod.toLowerCase() === 'pm') ? Number(day.closing_time.split(':')[0]) + 12 : day.closing_time.split(':')[0],
                closeMinutes = day.closing_time.split(':')[1].slice(0, 2),
                open         = new Date(),
                close        = new Date();
            //set time
            open.setHours(openHour);
            close.setHours(closeHour);

            open.setMinutes(openMinutes);
            close.setMinutes(closeMinutes);
            //set open close times for ui
            day.open = open;
            day.close = close;

        }, this);
        return this.vendor.hours;
    }

    //handle edit button for vendor ammenities
    editAmmenities() {
        this.ammenitiesRevertData = {
            eighteen_plus       : this.vendor.eighteen_plus,
            twenty_one_plus     : this.vendor.twenty_one_plus,
            has_handicap_access : this.vendor.has_handicap_access,
            has_lounge          : this.vendor.has_lounge,
            has_security_guard  : this.vendor.has_security_guard,
            has_testing         : this.vendor.has_testing,
            accepts_credit_cards: this.vendor.accepts_credit_cards
        };
    }

    //handle cancel edit button for vendor ammenities
    cancelEditAmmenities() {
        this.vendor.eighteen_plus = this.ammenitiesRevertData.eighteen_plus;
        this.vendor.twenty_one_plus = this.ammenitiesRevertData.twenty_one_plus;
        this.vendor.has_handicap_access = this.ammenitiesRevertData.has_handicap_access;
        this.vendor.has_lounge = this.ammenitiesRevertData.has_lounge;
        this.vendor.has_security_guard = this.ammenitiesRevertData.has_security_guard;
        this.vendor.has_testing = this.ammenitiesRevertData.has_testing;
        this.vendor.accepts_credit_cards = this.ammenitiesRevertData.accepts_credit_cards;

        this.ammenitiesRevertData = '';
    }

    //handle edit button for address
    editAddress() {
        this.addressRevertData = {
            address : this.vendor.address,
            state   : this.vendor.state,
            zip_code: this.vendor.zip_code,
            city    : this.vendor.city
        }
    }

    //handle cancel edit button for address
    cancelEditAddress() {
        this.vendor.address = this.addressRevertData.address;
        this.vendor.state = this.addressRevertData.state;
        this.vendor.city = this.addressRevertData.city;
        this.vendor.zip_code = this.addressRevertData.zip_code;

        this.addressRevertData = '';
    }

    //handle avatar file select
    onAvatarFileSelect(file, invalidFiles) {
        this.avatarErrorMsg = invalidFiles[0];
        if(file) {
            this.uploadingAvatar = true;
            file.upload = this.Upload.upload({
                url   : '/api/vendor/' + this.id + '/avatarimg',
                data  : {file: file},
                method: 'PUT'
            });

            file.upload
                .then((response) => {
                    //success
                    file.result = response.data;
                    this.log(response);
                    this.vendor = response.data;
                    this.hours = this.setUpHours();
                    this.avatarProgress = 0;
                    this.uploadingAvatar = false;
                    this.editing = ""

                }, (response) => {
                    //error
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
    }

    //close edit form for page info
    cancelEditPageInfo(field) {
        this.vendor[field] = this.editing;

        this.editing = '';
    }

    //close edit form for vendor type
    cancelEditType() {
        this.type = this.editing;

        this.editing = '';
    }

    //edit slug
    editSlug() {
        this.editing = 'slug';
        this.slugRevertData = this.vendor._slug;
    }

    //cancel edit slug
    cancelEditSlug() {
        this.editing = '';
        this.vendor._slug = this.slugRevertData;
    }

    //publish
    publish() {
        this.update({'_published': true});
    }

    //unpublish
    unPublish() {
        this.update({'_published': false});
    }

    //update vendor name
    updateName() {
        let name = {name: this.vendor.name};
        this.update(name);
    }

    //update vendor type
    updateType() {
        let type = {_type: this.type};
        this.update(type);
    }

    //update vendor address
    getCoords() {
        let where = {
            address: this.vendor.address + ' ' + this.vendor.zip_code
        };

        this.geocoderService.geocode(where)
            .then(this.updateAddress.bind(this))
            .catch((error)=> {
                this.log(error);
            })

    }

    updateAddress(loc) {
        let address = {
            address     : this.vendor.address,
            city        : this.vendor.city,
            state       : this.vendor.state,
            zip_code    : this.vendor.zip_code,
            phone_number: this.vendor.phone_number,
            loc
        };

        this.update(address);
    }

    //update business hours
    updateHours(day, isClosed) {
        let open    = this.moment(day.open).format('h:mma'),
            close   = this.moment(day.close).format('h:mma'),
            dayData = {
                hours: angular.copy(this.hoursRevertData)
            };

        if(isClosed) {
            day.closed = true;
        }
        dayData.hours.opening_time = (isClosed) ? null : open;
        dayData.hours.closing_time = (isClosed) ? null : close;
        delete dayData.hours.open;
        delete dayData.hours.close;
        delete dayData.hours.closed;

        this.update(dayData);
    }

    //update facility ammenties
    updateAmmenities() {
        let ammenities = {
            eighteen_plus       : this.vendor.eighteen_plus,
            twenty_one_plus     : this.vendor.twenty_one_plus,
            has_handicap_access : this.vendor.has_handicap_access,
            has_lounge          : this.vendor.has_lounge,
            has_security_guard  : this.vendor.has_security_guard,
            has_testing         : this.vendor.has_testing,
            accepts_credit_cards: this.vendor.accepts_credit_cardsf
        };
        this.update(ammenities);
    }

    //update slug
    updateSlug() {
        this.update({_slug: this.vendor._slug})
    }


    //update method for whole controller
    update(data) {
        this.vendorDataService.updateVendor(this.id, data)
            .$promise
            .then((data) => {
                this.log(data);
                this.editing = '';
                this.addressRevertData = '';
                this.hoursRevertData = '';
                this.ammenitiesRevertData = '';
                this.menu = data.menu;
                this.vendor = data;
                this.hours = this.setUpHours()

            })
            .catch((error) => {
                this.error('XHR Failed for getContributors.\n' + angular.toJson(error.data, true));
            });
    }
}


