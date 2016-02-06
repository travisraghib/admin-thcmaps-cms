export class geocoderService {
    constructor($q, google){
        'ngInject';

        //deps
        this.$q = $q;
        this.google = google;
        this.geocoder = new google.maps.Geocoder();

    }
    geocode (where){
        let defer = this.$q.defer();

        this.geocoder.geocode(where, function(results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
                let lat = results[0].geometry.location.lat(),
                    lng = results[0].geometry.location.lng();
                defer.resolve({lat, lng});
            } else {
                defer.reject(status);
                console.log("Geocode was not successful for the following reason: " + status);
            }
        });

        return defer.promise
    }
}
