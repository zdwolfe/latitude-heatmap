var restler = require('restler');
var multiRequest = function(accessToken, maxTime, minTime, callback, results) {
  if (!results) {
    results = [];
  }

  var baseUrl = "https://www.googleapis.com/latitude/v1/location?granularity=best&fields=items(latitude%2Clongitude%2CtimestampMs)&max-results=10";
  var url = baseUrl;
  if (maxTime) {
    url += "&max-time=" + maxTime;
  }
  if (minTime) {
    url += "&min-time=" + minTime;
  }
  url += "&access_token=" + accessToken;
  restler.get(url).on('complete',function(res) {
    if (!res.data) { return; }
    var items = res.data.items;
    results = results.concat(items);

    console.log('results.length = ' + results.length);
    if (results.length >= 50 ||
        items.length <= 0 ) {
      console.log("DONE!");
      return results;
    }

    var oldestTime = items[items.length - 1].timestampMs + 1;
    console.log('oldestTime = ' + oldestTime);
    return multiRequest(accessToken, maxTime, oldestTime, callback, results);

  });
};
var accessToken = "ya29.AHES6ZQk_7QXal2kvqoXUaDUPEzBIKoXrYtNV2V5156p9kE"; // will eventually be grabbed from web app
multiRequest(accessToken);
