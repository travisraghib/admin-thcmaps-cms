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
        var vendor = vendorDataService.data.pageInfo,
            type   = vendorDataService.data._type;

        // "this.creation" is available by directive option "bindToController: true"
        //handle vendor name
        this.slug = vendor.slug;
        //vendor type
        this.type = type;
        //last update
        this.lastUpdate = moment(vendor.updated_at).format('MM/DD/YYYY h:mm A')
        //menu collapsed
        this.isCollapsed = true;


    }
}
