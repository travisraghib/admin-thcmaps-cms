export class MainController {
    constructor($log, $stateParams, $scope, $timeout, vendorData, vendorDataService, constants, _, moment, Upload) {
        'ngInject';

        var vendor   = vendorData,
            pageInfo = vendor.pageInfo;

        //debug
        this.log = $log.log;
        this.error = $log.error;

        //dependancies
        this._ = _;
        this.vendorDataService = vendorDataService;
        this.Upload = Upload;
        this.id = $stateParams.id;
        this.moment = moment;
        this.timeout = $timeout;

        //view bound data
        this.pageInfo = pageInfo;
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
    }

    //se    tup editable hours objects
    setUpHours() {
        this._.each(this.pageInfo.hours, (day) => {
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
        return this.pageInfo.hours;
    }

    //handle edit button for vendor ammenities
    editAmmenities() {
        this.ammenitiesRevertData = {
            eighteen_plus       : this.pageInfo.eighteen_plus,
            twenty_one_plus     : this.pageInfo.twenty_one_plus,
            has_handicap_access : this.pageInfo.has_handicap_access,
            has_lounge          : this.pageInfo.has_lounge,
            has_security_guard  : this.pageInfo.has_security_guard,
            has_testing         : this.pageInfo.has_testing,
            accepts_credit_cards: this.pageInfo.accepts_credit_cards
        };
    }

    //handle cancel edit button for vendor ammenities
    cancelEditAmmenities() {
        this.pageInfo.eighteen_plus = this.ammenitiesRevertData.eighteen_plus;
        this.pageInfo.twenty_one_plus = this.ammenitiesRevertData.twenty_one_plus;
        this.pageInfo.has_handicap_access = this.ammenitiesRevertData.has_handicap_access;
        this.pageInfo.has_lounge = this.ammenitiesRevertData.has_lounge;
        this.pageInfo.has_security_guard = this.ammenitiesRevertData.has_security_guard;
        this.pageInfo.has_testing = this.ammenitiesRevertData.has_testing;
        this.pageInfo.accepts_credit_cards = this.ammenitiesRevertData.accepts_credit_cards;

        this.ammenitiesRevertData = '';
    }

    //handle edit button for address
    editAddress() {
        this.addressRevertData = {
            address : this.pageInfo.address,
            state   : this.pageInfo.state,
            zip_code: this.pageInfo.zip_code,
            city    : this.pageInfo.city
        }
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
                    this.pageInfo = response.data.pageInfo;
                    this.pageInfo.hours = this.setUpHours();
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

    //handle cancel edit button for address
    cancelEditAddress() {
        this.pageInfo.address = this.addressRevertData.address;
        this.pageInfo.state = this.addressRevertData.state;
        this.pageInfo.city = this.addressRevertData.city;
        this.pageInfo.zip_code = this.addressRevertData.zip_code;

        this.addressRevertData = '';
    }

    //close edit form for page info
    cancelEditPageInfo(field) {
        this.pageInfo[field] = this.editing;

        this.editing = '';
    }

    //close edit form for vendor type
    cancelEditType() {
        this.type = this.editing;

        this.editing = '';
    }

    //update vendor name
    updateName() {
        let name = {pageInfo: {name: this.pageInfo.name}};
        this.update(name);
    }

    //update vendor type
    updateType() {
        let type = {_type: this.type};
        this.update(type);
    }

    //update vendor address
    updateAddress() {
        let address = {
            pageInfo: {
                address     : this.pageInfo.address,
                city        : this.pageInfo.city,
                state       : this.pageInfo.state,
                zip_code    : this.pageInfo.zip_code,
                phone_number: this.pageInfo.phone_number
            }
        };
        this.update(address)
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

        this.log(dayData);
        this.update(dayData);
    }

    //update facility ammenties
    updateAmmenities() {
        let ammenities = {
            pageInfo: {
                eighteen_plus       : this.pageInfo.eighteen_plus,
                twenty_one_plus     : this.pageInfo.twenty_one_plus,
                has_handicap_access : this.pageInfo.has_handicap_access,
                has_lounge          : this.pageInfo.has_lounge,
                has_security_guard  : this.pageInfo.has_security_guard,
                has_testing         : this.pageInfo.has_testing,
                accepts_credit_cards: this.pageInfo.accepts_credit_cardsf
            }
        };
        this.update(ammenities);
    }

    //update method for whole controller
    update(data) {
        this.vendorDataService.updateVendor(this.id, data)
            .$promise
            .then((data) => {
                this.editing = '';
                this.addressRevertData = '';
                this.hoursRevertData = '';
                this.ammenitiesRevertData = '';
                this.menu = data.menu;
                this.pageInfo = data.pageInfo;
                this.pageInfo.hours = this.setUpHours()

            })
            .catch((error) => {
                this.error('XHR Failed for getContributors.\n' + angular.toJson(error.data, true));
            });
    }
}


