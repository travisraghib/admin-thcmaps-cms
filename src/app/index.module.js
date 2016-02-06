/* global moment:false _:false google:false */

import { config } from './index.config';
import { routerConfig } from './index.route';
import { runBlock } from './index.run';
import { MainController } from './main/main.controller';
import { LoginController } from './login/login.controller';
import { SelectController } from './select/select.controller';

import { NavbarDirective } from './components/navbar/navbar.directive';
import { MenuTabDirective } from './components/menuTab/menuTab.directive';
import { MenuItemFormDirective  } from './components/menuTab/menuItemForm/menuItemForm.directive';
import { MongooseErrorDirective } from './components/mongooseError/MongooseError.directive';

import { vendorDataService } from './components/vendorData/vendorData.service';
import { authDataService } from './components/authData/authData.service';
import { sessionStorageService } from './components/sessionStorage/sessionStorage.service';
import { tokenService } from './components/token/token.service';
import { interceptorService } from './components/interceptor/interceptor.service';
import { formFieldService } from './components/formly/formField.service';
import { geocoderService } from './components/geocoder/geocoder.service';

import { constants } from './index.constants';

angular.module('thcmaps-cms', ['ngAnimate', 'ngFileUpload', 'ngCookies', 'ngTouch', 'ngSanitize', 'ngMessages',
                               'ngResource', 'ui.router', 'ui.bootstrap', 'formly', 'formlyBootstrap'])
    .constant('moment', moment)
    .constant('_', _)
    .constant('google', google)
    .constant('constants', constants)
    .config(config)
    .config(routerConfig)

    .run(runBlock)

    .service('interceptorService', interceptorService)
    .service('tokenService', tokenService)
    .service('sessionStorageService', sessionStorageService)
    .service('vendorDataService', vendorDataService)
    .service('authDataService', authDataService)
    .service('formFieldService', formFieldService)
    .service('geocoderService', geocoderService)

    .controller('SelectController', SelectController)
    .controller('LoginController', LoginController)
    .controller('MainController', MainController)

    .directive('navbar', NavbarDirective)
    .directive('menuTab', MenuTabDirective)
    .directive('mongooseError', MongooseErrorDirective)
    .directive('menuItemForm', MenuItemFormDirective);
