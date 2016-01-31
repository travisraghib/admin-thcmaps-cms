export function MongooseErrorDirective() {
    'ngInject';

    let directive = {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, element, attrs, ngModel) {
            element.on('keydown', () => ngModel.$setValidity('mongoose', true));
        }
    };
    return directive;
}
