export function interceptor (interceptorService, $injector){
    'ngInject';
    return interceptorService.generateInterceptor($injector);
}
