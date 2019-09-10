'use strict';

const PromiseFtp = require('promise-ftp');
const _ = require('lodash');
const Promise = require('bluebird');

const ftpget = Promise.promisifyAll(require('ftp-get'));
const fs = Promise.promisifyAll(require('fs'));
const xmlParser = Promise.promisifyAll(require('xml2js'));
const unzipper = Promise.promisifyAll(require('unzipper'));

const access = require('../config/access').ftp;

const { host, user, password } = access;

const buildImageFtpUrl = dir => `ftp://${user}:${password}@ftp.publicationvo.com${dir}`;
const remoteDataPath = '/datas/acaa.xml';
const remotePhotoPath = '/datas/photos.txt.zip';
const localPath = 'selsia-data';
const localPhotoDir = `src/assets/selsia-photos`;
const localPhotoPath = `${localPath}/photos.txt`;
const localPhotoZipPath = `${localPath}/photos.txt.zip`;
const localDataPath = `${localPath}/acaa.xml`;

const createFileFromStream = (stream, path, unzipPath) =>
  new Promise(function (resolve, reject) {
    stream.once('close', resolve);
    stream.once('error', reject);
    stream.pipe(fs.createWriteStream(path));

    if (unzipPath) stream.pipe(unzipper.Extract({ path: localPath }));
  });

const loadFtpData = (req, res) => {
  const ftp = new PromiseFtp();

  return ftp.connect({ host, user, password })
    .then(() => ftp.get(remoteDataPath))
    .then(stream => createFileFromStream(stream, localDataPath))
    .then(() => ftp.get(remotePhotoPath))
    .then(stream => createFileFromStream(stream, localPhotoZipPath, localPath))
    .then(() => ftp.end())
    .then(() => res.send(`retrieved and saved ${localDataPath} and ${localPhotoZipPath}`))
    .catch(() => res.send(`an error occured while trying to get ${localDataPath} and ${localPhotoZipPath}`));
}

const getAnnonces = Promise.coroutine(function* (req, res) {
  const data = yield fs.readFileAsync(localDataPath, 'utf-8');
  const json = data ? yield xmlParser.parseStringAsync(data) : null;
  const annonces = _.get(json, 'Stock.Vehicule');

  return res.send(annonces);
});

const buildPhotoObject = photos => _.reduce(photos, (acc, value) => {
  if (!value) return acc;

  const [name, directory, hash] = _.split(_.trim(value), '\t');
  const info = { _id: _.replace(name, '.jpg', ''), name, directory, hash };

  return _.concat(acc, info);
}, []);

const loadFtpImages = photos => Promise.mapSeries(photos, photo => {
  return ftpget
    .getAsync({ url: buildImageFtpUrl(photo.directory), bufferType: 'buffer' })
    .then(buffer => fs.writeFileAsync(`${localPhotoDir}/${photo.name}`, buffer, 'binary'))
})

const getPhotos = Promise.coroutine(function* () {
  const data = yield fs.readFileAsync(localPhotoPath, 'utf-8');
  if (!data) return res.send(`Impossible de récupérer le fichier ${localPhotoPath}`);

  const splitted = data.toString().split('\n');
  const photos = buildPhotoObject(splitted);

  return photos;
});

const loadImages = Promise.coroutine(function* (req, res) {
  const photos = yield getPhotos;
  const images = yield loadFtpImages(photos);

  console.log(`Retrieved ${_.size(images)} images from server`);

  return res.end();
});

module.exports = (app) => {
  app.get('/load-ftp-data', loadFtpData);
  app.get('/get-annonces', getAnnonces);
  app.get('/load-images', loadImages);
  app.get('/get-photos', Promise.coroutine(function* (req, res) {
    return res.send(yield getPhotos());
  }));
}
