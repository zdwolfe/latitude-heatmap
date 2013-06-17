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
    $("#authButton").hide();
    $("#datepickers").show();
    $("#go").show();
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

function makeLatitudeRequest(oldestDate, newestDate, successCallback, failureCallback) { 
    $.ajax({
        url: "https://www.googleapis.com/latitude/v1/location",
        type: "GET",
        dataType: "json",
        data: {
            "fields": "items(latitude,longitude,timestampMs)",
            "max-results": "1000",
            "granularity": "best",
            "access_token": latitude.accessToken,
            "min-time": oldestDate,
            "max-time": newestDate
        },
        success: function(response) {
            if (response.data && response.data.items) {
                newestDate = response.data.items[response.data.items.length - 1].timestampMs - 1;
                addDataToHeatmap(response.data.items);
                return makeLatitudeRequest(oldestDate, newestDate, successCallback);
            } else {
                if (!heatmapData || !heatmapData.data || heatmapData.data.length <= 0) {
                    return failureCallback("Couldn't get any data from Latitude! Have you recorded any?");
                } else {
                    return successCallback();
                }
            }
        },
        error: function(response, status, err) {
            return;
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
    if (!heatmap) {
        return;
    }
    heatmap.setDataSet(heatmapData);
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
            navigationControl: true,
            mapTypeControl: true,
            scaleControl: true,
            disableDoubleClickZoom: false
        };
        map = new google.maps.Map(document.getElementById("heatmap"), myOptions);
        heatmap = new HeatmapOverlay(map, {"radius":15, "visible":true, "opacity":60});
    }, function() {
        //39.8282° N, 98.5795° W is geographic center of USA
        var myLatlng = new google.maps.LatLng(39.8282, -98.5795);
        var myOptions = {
            zoom: 4,
            center: myLatlng,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            disableDefaultUI: true,
            scrollwheel: true,
            draggable: true,
            navigationControl: true,
            mapTypeControl: true,
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
    var oldestDate = $("#oldestDate").datepicker("getDate").getTime();
    var newestDate = $("#newestDate").datepicker("getDate").getTime();

    $("#optionsModal").modal("hide");
    $("#statusbar").show();
    $("#spinner").spin();

    makeLatitudeRequest(oldestDate, newestDate, function() {
        $("#spinner").stop();
        $("#statusbar").fadeOut();
    }, function(message) {
        $("#spinner").stop();
        $("#spinner").fadeOut('fast', function() {
            $("#statusbar").removeClass("transparent").addClass("opaque");
            $("#message").fadeIn();
            $("#message").text(message);
        });
    });
});


