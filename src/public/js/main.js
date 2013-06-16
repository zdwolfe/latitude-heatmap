var map;
var heatmap; 
var heatmapData = {
    "data": [],
    "max": 0
};
var oldestDate = "";
var newestDate = "";
var latitude = {
    key: "AIzaSyBWVoIh-RQHnaRC-w1-cTHxdddoJe0UGEM",
    scopes: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/latitude.all.best",
        "https://www.googleapis.com/auth/userinfo.email"
    ],
    clientId: "740421658448.apps.googleusercontent.com",
    accessToken: ""
};

function handleAuthResult(authResult) {
    if (!authResult) {
        console.log('authResult is undefined');
        return;
    }
    latitude.accessToken = authResult.access_token;
}

function handleClientLoad() {
    gapi.client.setApikey(latitude.key);
    window.setTimeout(function() {
        gapi.auth.authorize({
            client_id: latitude.clientId,
            scope: latitude.scopes,
            immediate: true
        }, handleAuthResult);
    },1);
}

function getData(oldestDate, newestDate, callback) { 
    d = {};
    d.oldest = oldestDate.getTime();
    d.newest = newestDate.getTime();
    d.accesstoken = latitude.accessToken;
    _multiRequest(d,callback);
}


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

$(function() {
    // initialize full-page google map centered on current position 
    navigator.geolocation.getCurrentPosition(function(position) {
        var coords = position.coords || position.coordinate || position;
        var myLatlng = new google.maps.LatLng(coords.latitude, coords.longitude);
        var myOptions = {
            zoom: 6,
            center: myLatlng,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            disableDefaultUI: true,
            scrollwheel: true,
            draggable: true,
            navigationControl: false,
            mapTypeControl: false,
            scaleControl: true,
            disableDoubleClickZoom: false
        };
        map = new google.maps.Map(document.getElementById("heatmap"), myOptions);
        heatmap = new HeatmapOverlay(map, {"radius":15, "visible":true, "opacity":60});
    });

    // initialize date pickers
    $('#oldestDate').datepicker({
        format: 'mm-dd-yyyy'
    }); 
    $("#oldestDate").datepicker().on("changeDate", function(ev) {
        oldestDate = new Date(ev.date.valueOf());
    });
    oldestDate = Date.today().last().week();
    $("#oldestDate").datepicker('setDate', oldestDate);

    $('#newestDate').datepicker({
        format: 'mm-dd-yyyy'
    }); 
    $("#newestDate").datepicker().on("changeDate", function(ev) {
        newestDate = new Date(ev.date.valueOf());
    });
    newestDate = Date.today();
    $("#newestDate").datepicker('setDate', newestDate);

    // initialize options modal
    $('#optionsModal').modal({
        width: "320px"
    });
});

$("#authButton").click(function() {
    $(this).button("loading");
    gapi.auth.authorize({
        client_id: latitude.clientId,
        scope: latitude.scopes,
        immediate: false
    }, handleAuthResult);
});

$("#go").click(function() {
    $(this).button("loading");
    var oldestDate = $("#oldestDate").datepicker("getDate");
    var newestDate = $("#newestDate").datepicker("getDate");

$("#optionsModal").modal("hide");
    getData(oldestDate, newestDate, function() {
        console.log('latitude.getData callback!');
    });
});


