export class sessionStorageService {

    //Set local storage data
    setData(key, obj) {
        sessionStorage[key] = angular.toJson(obj);
        return obj;
    }

    //Getting local storage for search options
    getData(key) {
        let str = sessionStorage.getItem(key);
        return angular.fromJson(str);
    }

}
