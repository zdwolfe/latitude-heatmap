var map;
var heatmap; 
var heatmapData = [];
var oldestDate = "";
var newestDate = "";

function positionSuccess(position) {
    var coords = position.coords || position.coordinate || position;
    var myLatlng = new google.maps.LatLng(coords.latitude, coords.longitude);
    var myOptions = {
        zoom: 6,
        center: myLatlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        disableDefaultUI: false,
        scrollwheel: true,
        draggable: true,
        navigationControl: true,
        mapTypeControl: false,
        scaleControl: true,
        disableDoubleClickZoom: false
    };
    map = new google.maps.Map(document.getElementById("heatmap"), myOptions);
    heatmap = new HeatmapOverlay(map, {"radius":15, "visible":true, "opacity":60});
}

function positionError(err) {
    console.log("positionError err = " + JSON.stringify(err));
}

$(function() {
    navigator.geolocation.getCurrentPosition(positionSuccess, positionError);
});

$(function() {
    // initialize date pickers
    $('#oldestDate').datepicker({
        format: 'mm-dd-yyyy'
    }); 
    $("#oldestDate").datepicker().on("changeDate", function(ev) {
        oldestDate = new Date(ev.date.valueOf());
    });
    oldestDate = Date.today().last().week();
    $("#oldestDate").datepicker('setValue', oldestDate);

    $('#newestDate').datepicker({
        format: 'mm-dd-yyyy'
    }); 
    $("#newestDate").datepicker().on("changeDate", function(ev) {
        newestDate = new Date(ev.date.valueOf());
    });
    newestDate = Date.today();
    $("#newestDate").datepicker('setValue', newestDate);
});


$("#getData").click(function() {
    var oldestDate = $("#oldestDate").datepicker("getDate");
    var newestDate = $("#newestDate").datepicker("getDate");
    console.log("oldestDate = " + oldestDate);
    console.log("newestDate = " + newestDate);
    console.log('oldestDate.getTime() = ' + oldestDate.getTime());
    console.log('newestDate.getTime() = ' + newestDate.getTime());
    $.ajax({
        "url": "/data",
        "dataType": "json",
        "data": {
           "oldest": oldestDate.getTime(),
           "newest": newestDate.getTime()
        },
        "success": function(data) {
            console.log("getData success callback, data="+JSON.stringify(data));
            heatmapData = data;
            google.maps.event.addListenerOnce(map, "idle", function(){
                console.log("google maps eventlistener callback");
                heatmap.setDataSet(heatmapData);
            });
        }
    });
});


