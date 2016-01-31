export class UtilService {
    constructor($window, $document) {
        'ngInject';
        //deps
        this.$window = $window;
        this.$document = $document;
    }

    /**
     * Return a callback or noop function
     *
     * @param  {Function|*} cb - a 'potential' function
     * @return {Function}
     */
    safeCb(cb) {
        return (angular.isFunction(cb)) ? cb : angular.noop;
    }

    /**
     * Parse a given url with the use of an anchor element
     *
     * @param  {String} url - the url to parse
     * @return {Object}     - the parsed url, anchor element
     */
    urlParse(url) {
        var a = this.$document.createElement('a');
        a.href = url;
        return a;
    }

    /**
     * Test whether or not a given url is same origin
     *
     * @param  {String}           url       - url to test
     * @param  {String|String[]}  [origins] - additional origins to test against
     * @return {Boolean}                    - true if url is same origin
     */
    isSameOrigin(url, origins) {
        url = this.urlParse(url);
        origins = (origins && [].concat(origins)) || [];
        origins = origins.map(this.urlParse);
        origins.push(this.$window.location);
        origins = origins.filter(function(o) {
            return url.hostname === o.hostname &&
                url.port === o.port &&
                url.protocol === o.protocol;
        });
        return (origins.length >= 1);
    }
}

