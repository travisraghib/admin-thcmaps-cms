export function NavbarDirective() {
    'ngInject';

    let directive = {
        restrict        : 'E',
        templateUrl     : 'app/components/navbar/navbar.html',
        scope           : {
            creationDate: '='
        },
        controller      : NavbarController,
        controllerAs    : 'nav',
        bindToController: true
    };

    return directive;
}

class NavbarController {
    constructor(moment, vendorDataService) {
        'ngInject';
        var vendor = vendorDataService.data,
            type   = vendorDataService.data._type,
            lastUpdate = new Date(vendor.updated_at);

        //handle vendor name
        this.slug = vendor.slug;
        //vendor type
        this.type = type;
        //last update
        this.lastUpdate = new moment(lastUpdate).format('MM/DD/YYYY h:mm A');
        //menu collapsed
        this.isCollapsed = true;
    }
}
