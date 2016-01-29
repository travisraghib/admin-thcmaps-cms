export function config($logProvider, $httpProvider) {
    'ngInject';
    // Enable log
    $logProvider.debugEnabled(true);

    //handle interceptor
    $httpProvider.interceptors.push('interceptor');
    $httpProvider.defaults.useXDomain = true;
}
