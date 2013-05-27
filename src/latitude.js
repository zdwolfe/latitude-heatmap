var restler = require('restler');
var multiRequest = function(target, accessToken, callback, results) {
  accessToken = "ya29.AHES6ZQk_7QXal2kvqoXUaDUPEzBIKoXrYtNV2V5156p9kE"; // will eventually be grabbed from web app
  if (!results) {
    results = [];
  }

  var baseUrl = "https://www.googleapis.com/latitude/v1/location?granularity=best&fields=items(latitude%2Clongitude%2CtimestampMs)&max-results=10";
  var url = baseUrl + "&access_token=" + accessToken;
  restler.get(url).on('complete',function(res) {
    if (!res.data) { return; }
    console.log('res = ' + JSON.stringify(res));
    var lastTimestamp = res.data.items[0].timestampMs;
    var thisTimestamp = lastTimestamp;
    for (var i = 1; i < res.data.items.length; i++) {
      console.log('i='+i);
      thisTimestamp = res.data.items[i].timestampMs;
      if (thisTimestamp > lastTimestamp) {
        console.log('thisTimestamp > lastTimestamp');
      }
      if (thisTimestamp < lastTimestamp) {
        console.log('thisTimestamp < lastTimestamp');
      }
    }
    return;
  });
}
multiRequest();
