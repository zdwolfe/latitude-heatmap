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
}

function positionError(err) {
}

$(function() {
    navigator.geolocation.getCurrentPosition(positionSuccess, positionError);
});

function initDatepickers() {
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
}

$(function() {
    initDatepickers();
    $('#optionsModal').modal({
        width: "320px"
    });
});


$("#go").click(function() {
    $(this).button("loading");
    var oldestDate = $("#oldestDate").datepicker("getDate");
    var newestDate = $("#newestDate").datepicker("getDate");
    $.ajax({
        "url": "/data",
        "dataType": "json",
        "timeout": 0,
        "data": {
           "oldest": oldestDate.getTime(),
           "newest": newestDate.getTime()
        },
        "success": function(data) {
            heatmapData = data;
            heatmap.setDataSet(heatmapData);
            $("#optionsModal").modal("hide");
        }
    });
});


