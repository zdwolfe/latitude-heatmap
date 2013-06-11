var restler = require('restler');
var DEBUG = 1;

function debug(message) {
    if (DEBUG == 1) {
        console.log(message);
    }
    return;
}

function _multiRequest(d, callback, items) {
    items = items || [];
    var request = getRequest(d);
    restler.get(request).on('success', function(response, data) {
        if (!response || !response.data || !response.data.items) {
            debug('response = ' + JSON.stringify(response));
            return;
        }
        items = items.concat(response.data.items);
        if (response.data && response.data.items && response.data.items < d.maxresults) {
            debug('response.data.items < d.maxresults');
            return callback(items);
        } else {
            // Items at the end of response.data.items are older than items at the beginning.
            // Therefore the last item in response.data.items is the 'oldest', and should be
            // the next request's newest item.
            // We subtract 1 ms because we don't want the oldest item again
            d.newest = response.data.items[response.data.items.length].timestampMs - 1;
            debug('return _multiRequest');
            return _multiRequest(d,callback,items);
        } 
        debug('reached end');
    });
}

function multiRequest(d, callback) { 
    return _multiRequest(d,callback);
}

function getRequest(d) {
    d.newest = d.newest || (new Date()).getTime();
    d.oldest = d.oldest || 0;
    d.granularity = d.granularity || "best";
    d.fields = d.fields || "items";
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

var accesstoken = "ya29.AHES6ZThc_xgoOZCxX6jYPNumKme6o8rWm5Oou13rpAsEon1sSZavFat"; // will eventually be grabbed from web app
multiRequest({
    "accesstoken": accesstoken,
    "baseUrl": "https://www.googleapis.com/latitude/v1/location",
    "granularity": "best",
    "fields": "items(latitude%2Clongitude%2CtimestampMs)",
    "maxresults": 10
}, function(response) {
    debug(JSON.stringify(response));
});
