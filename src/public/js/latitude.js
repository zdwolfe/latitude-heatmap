var latitude = latitude || {};

function _multiRequest(d, callback) {
    var request = getRequest(d);
    $.get(request, function(response) {
        if (response.data && response.data.items) {
            d.newest = response.data.items[response.data.items.length - 1].timestampMs - 1;
            addDataToHeatmap(response.data.items);
            return _multiRequest(d, callback);
        } else {
            callback();
        }
    });
}

latitude.getData = function(oldestDate, newestDate, callback) { 
    d = {};
    d.oldest = oldestDate.getTime();
    d.newest = newestDate.getTime();
    d.accesstoken = latitude.accesstoken;
    _multiRequest(d,callback);
};

function addDataToHeatmap(data) {
    if (!data) {
        return;
    }
    var locations = {};
    for (var i = 0; i < data.length; i++) {
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
    var max = 0;
    for (var longitude in locations) {
        for (var latitude in locations[longitude]) {
            if (locations.hasOwnProperty(longitude) && 
                locations[longitude].hasOwnProperty(latitude) &&
                locations[longitude][latitude].hasOwnProperty("count")
               ) {
                heatmapData.max = Math.max(locations[longitude][latitude].count, 
                   heatmapData.max);
                heatmapData.data.push({
                    "lng": longitude,
                    "lat": latitude,
                    "count": locations[longitude][latitude].count
                });
            }
        }
    }
    heatmap.setDataSet(heatmapData);
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
    return request;
}
