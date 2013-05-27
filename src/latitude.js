var restler = require('restler');

exports.multiRequest = function(target, accessToken, callback, results) {
  if (!results) {
    results = [];
  }

  var baseUrl = "https://www.googleapis.com/latitude/v1/location";
  var url = baseUrl;
}
