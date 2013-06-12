var restler = require('restler');
var DEBUG = 1;
var INFO = 1;

function debug(message) {
    if (DEBUG == 1) {
        console.log(message);
    }
    return;
}

function info(message) {
    if (INFO == 1) {
        console.log(message);
    }
    return;
}

function _multiRequest(d, callback, items) {
    items = items || [];
    var request = getRequest(d);
    restler.get(request).on('success', function(response) {
        if (response.data && response.data.items) {
            debug(JSON.stringify(response.data.items));
            if (response.data.items[response.data.items.length-1].timestampMs < d.oldest) {
                for (var i = 0; i < response.data.items.length; i++) {
                    items.push(resposne.data.items[i]);
                }
                return prepareData(callback(items));
            } else {
                items = items.concat(response.data.items);
                d.newest = response.data.items[response.data.items.length - 1].timestampMs - 1;
                return _multiRequest(d, callback, items);
            }
        } else {
            prepareData(callback(items));
        }
    });
}

exports.getData = function(d, callback) { 
    return prepareData(_multiRequest(d,callback));
};

function prepareData(data) {
    debug("prepareData data.length = " + data.length);
    var retData = [];
    var item = {};
    var locations = {};
    for (var i = 0; i < data.length; i++) {
        item = {};
        if (data[i].hasOwnProperty("longitude") && 
            data[i].hasOwnProperty("latitude")) {
            if (!locations.hasOwnProperty(data[i].longitude)) {
                locations[data[i].longitude] = {};
            }
            if (!locations[data[i].longitude].hasOwnProperty(data[i].latitude)) {
                locations[data[i].longitude][data[i].latitude] = {};
            }
            var count = locations[data[i].longitude][data[i].latitude].count || 0;
            locations[data[i].longitude][data[i].latitude].count = count + 1;
        }
    }
    // at this point we have an object (locations) with properties for each longitude. each of 
    // those properties has a property for each latitude at that longitude
    // each of those properties has a count
}

function getRequest(d) {
    d.baseUrl = d.baseUrl || "https://www.googleapis.com/latitude/v1/location";
    d.newest = d.newest || (new Date()).getTime();
    d.oldest = d.oldest || d.newest - 2*24*60*60*1000;
    d.granularity = d.granularity || "best";
    d.fields = d.fields || "items(latitude%2Clongitude%2CtimestampMs)";
    d.maxresults = d.maxresults || "1000";

    if (!d.baseUrl) {  return null; }
    var request = d.baseUrl;
    request += "?fields=" + d.fields;
    request += "&granularity=" + d.granularity;
    request += "&max-results=" + d.maxresults;
    request += "&min-time=" + d.oldest;
    request += "&max-time=" + d.newest;
    request += "&access_token=" + d.accesstoken;

    debug('getRequest request ' + request);
    return request;
}

/*
multiRequest({
    "accesstoken": "ya29.AHES6ZRR9D_k_i4BEBUro-_fGtZrUy9wk-WOj9b6Emv3gaIaQDnYf80V",
    "baseUrl": "https://www.googleapis.com/latitude/v1/location",
    "granularity": "best",
    "fields": "items(latitude%2Clongitude%2CtimestampMs)",
    "maxresults": 1000,
    "oldest": "1370896150000"
}, function(response) {
    info(JSON.stringify(response));
});
*/
