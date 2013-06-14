var map;
var heatmap; 
var heatmapData = [];

window.onload = function(){
	var myLatlng = new google.maps.LatLng(48.3333, 16.35);
	// sorry - this demo is a beta
	// there is lots of work todo
	// but I don't have enough time for eg redrawing on dragrelease right now
	var myOptions = {
	  zoom: 2,
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
	map = new google.maps.Map(document.getElementById("heatmapArea"), myOptions);
	heatmap = new HeatmapOverlay(map, {"radius":15, "visible":true, "opacity":60});
};

$("#getData").click(function() {
    $.ajax({
        "url": "/data",
        "data": {
           "oldest": "1370896150000" 
        },
        "success": function(data) {
            console.log("getData success callback, data.length="+data.length);
            heatmapData = data;
            google.maps.event.addListenerOnce(map, "idle", function(){
                console.log("google maps eventlistener callback");
                heatmap.setDataSet(heatmapData);
            });
        }
    });
});


