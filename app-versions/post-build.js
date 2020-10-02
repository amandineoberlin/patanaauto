const path = require('path');
const Promise = require('bluebird');

const fs = Promise.promisifyAll(require('fs'));

const logger = require('../modules/logger');

const appVersion = require('../package.json').version;

logger.info('\nRunning post-build tasks');

const versionFilePath = path.join(__dirname + '/../src/dist/patanaauto/version.json');

let mainHash = '';
let mainBundleFile = '';

// RegExp to find main.bundle.js, even if it doesn't include a hash in it's name (dev build)
let mainBundleRegexp = /^main-es5.?([a-z0-9]*)?(\.bundle)?.js$/;

// read the dist folder files and find the one we're looking for
return fs.readdirAsync(path.join(__dirname, '/../src/dist/patanaauto'))
  .then((files) => {
    mainBundleFile = files.find(f => mainBundleRegexp.test(f));

    if (mainBundleFile) {
      let matchHash = mainBundleFile.match(mainBundleRegexp);

      // if it has a hash in it's name, mark it down
      if (matchHash.length > 1 && !!matchHash[1]) {
        mainHash = matchHash[1];
      }
    }

    logger.info(`Writing version and hash to ${versionFilePath}`);

    // write current version and hash into the version.json file
    const src = `{"version": "${appVersion}", "hash": "${mainHash}"}`;
    return fs.writeFileAsync(versionFilePath, src);
  }).then(() => {
    // main bundle file not found, dev build?
    if (!mainBundleFile) return;

    logger.info(`Replacing hash in the ${mainBundleFile}`);

    // replace hash placeholder in our main.js file so the code knows it's current hash
    const mainFilepath = path.join(__dirname, '/../src/dist/patanaauto/', mainBundleFile);
    return fs.readFileAsync(mainFilepath, 'utf8')
      .then((mainFileData) => {
        const replacedFile = mainFileData.replace('{{POST_BUILD_ENTERS_HASH_HERE}}', mainHash);
        return fs.writeFileAsync(mainFilepath, replacedFile);
      });
  }).catch(err => logger.error('Error with post build:', err));
