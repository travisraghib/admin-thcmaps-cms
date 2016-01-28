/* global moment:false _:false */

import { config } from './index.config';
import { routerConfig } from './index.route';
import { runBlock } from './index.run';
import { MainController } from './main/main.controller';
import { NavbarDirective } from './components/navbar/navbar.directive';
import { MenuTabDirective } from './components/menuTab/menuTab.directive';
import { MenuItemFormDirective  } from './components/menuTab/menuItemForm/menuItemForm.directive';
import { vendorDataService } from './components/vendorData/vendorData.service';
import { constants } from './index.constants';


angular.module('thcmaps-cms', ['ngAnimate', 'ngFileUpload', 'ngCookies', 'ngTouch', 'ngSanitize', 'ngMessages', 'ngResource', 'ui.router', 'ui.bootstrap'])
    .constant('moment', moment)
    .constant('_', _)
    .constant('constants', constants)
    .config(config)
    .config(routerConfig)
    .run(runBlock)
    .service('vendorDataService', vendorDataService)
    .controller('MainController', MainController)
    .directive('navbar', NavbarDirective)
    .directive('menuTab', MenuTabDirective)
    .directive('menuItemForm', MenuItemFormDirective);
