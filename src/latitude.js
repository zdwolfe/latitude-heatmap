var restler = require('restler');
var multiRequest = function(accessToken, maxTime, minTime, stepMinTime, callback, results) {
  console.log('multiRequest('+accessToken+','+maxTime+','+minTime+','+stepMinTime+')');
  if (!results) {
    results = [];
  }

  var baseUrl = "https://www.googleapis.com/latitude/v1/location?granularity=best&fields=items(latitude%2Clongitude%2CtimestampMs)&max-results=10";
  var url = baseUrl;
  if (maxTime) {
    url += "&max-time=" + maxTime;
  }
  if (stepMinTime) {
    url += "&min-time=" + stepMinTime;
  }
  url += "&access_token=" + accessToken;
  console.log('url = ' + url);
  restler.get(url).on('complete',function(res) {
    console.log('restler.on(complete)');
    if (!res.data) { return; }
    var items = res.data.items;
    console.log('items.length='+items.length);
    results = results.concat(items);
    var lastItem = res.data.items[res.data.items.length - 1];

    console.log('results.length = ' + results.length);
    if (results.length >= 50 ||
        items.length <= 0 ||
        stepMinTime < minTime) {
      console.log("DONE!");
      return results;
    }

    var newStepMinTime = lastItem.timestampMs + 1;
    console.log('newStepMinTime = ' + newStepMinTime);
    return multiRequest(accessToken, maxTime, minTime, newStepMinTime, callback, results);

  });
};
var accessToken = "ya29.AHES6ZQWP-p8Cy0On_dphJTQwoxhL9GFsyRzZNKE8j5L3Y4"; // will eventually be grabbed from web app
multiRequest(accessToken, 1369573200000, 1369584000000);
