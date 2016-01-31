export function config($logProvider, $httpProvider) {
    'ngInject';
    // Enable log
    $logProvider.debugEnabled(true);

    //handle interceptor
    $httpProvider.interceptors.push('interceptorService');
    //$httpProvider.defaults.useXDomain = true;
}
