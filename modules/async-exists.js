const Promise = require('bluebird');
const fs = require('fs');

fs.existsAsync = Promise.promisify
(function exists2(path, exists2callback) {
  fs.exists(path, function callbackWrapper(exists) { exists2callback(null, exists); });
});
