/* global moment:false _:false */

import { config } from './index.config';
import { routerConfig } from './index.route';
import { runBlock } from './index.run';
import { MainController } from './main/main.controller';
import { LoginController } from './login/login.controller';
import { NavbarDirective } from './components/navbar/navbar.directive';
import { MenuTabDirective } from './components/menuTab/menuTab.directive';
import { MenuItemFormDirective  } from './components/menuTab/menuItemForm/menuItemForm.directive';
import { vendorDataService } from './components/vendorData/vendorData.service';
import { authDataService } from './components/authData/authData.service';
import { sessionStorageService } from './components/sessionStorage/sessionStorage.service';
import { tokenService  } from './components/token/token.service';
import { interceptorService  } from './components/interceptor/inteceptor.service';
import { interceptor  } from './components/interceptor/inteceptor';
import { constants } from './index.constants';

angular.module('thcmaps-cms', ['ngAnimate', 'ngFileUpload', 'ngCookies', 'ngTouch', 'ngSanitize', 'ngMessages',
                               'ngResource', 'ui.router', 'ui.bootstrap'])
    .constant('moment', moment)
    .constant('_', _)
    .constant('constants', constants)
    .config(config)
    .config(routerConfig)
    .run(runBlock)
    .service('interceptorService', interceptorService)
    .service('tokenService', tokenService)
    .service('sessionStorageService', sessionStorageService)
    .service('vendorDataService', vendorDataService)
    .service('authDataService', authDataService)
    .service('interceptor', interceptor)
    .controller('LoginController', LoginController)
    .controller('MainController', MainController)
    .directive('navbar', NavbarDirective)
    .directive('menuTab', MenuTabDirective)
    .directive('menuItemForm', MenuItemFormDirective);
