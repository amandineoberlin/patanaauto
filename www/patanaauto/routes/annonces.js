'use strict';

const PromiseFtp = require('promise-ftp');
const _ = require('lodash');
const Promise = require('bluebird');
const unzipper = require('unzipper')

const ftpget = Promise.promisifyAll(require('ftp-get'));
const fs = Promise.promisifyAll(require('fs'));
const xmlParser = Promise.promisifyAll(require('xml2js'));

const access = require('../config/access').ftp;

const { host, user, password } = access;

const buildImageFtpUrl = dir => `ftp://${user}:${password}@ftp.publicationvo.com${dir}`;
const splitData = data => data.toString().split('\n');

const remoteDataPath = '/datas/acaa.xml';
const remotePhotoPath = '/datas/photos.txt.zip';
const localPath = 'selsia-data';
const localPhotoDir = `src/assets/selsia-photos`;
const localPhotoPath = `${localPath}/photos.txt`;
const localPhotoZipPath = `${localPath}/photos.txt.zip`;
const tempDir = `${localPath}/new`;
const tempZip = `${localPath}/new/photos.txt.zip`;
const tempPhoto = `${localPath}/new/photos.txt`;
const localDataPath = `${localPath}/acaa.xml`;

const createFileFromStream = (stream, path, shouldUnZip) =>
  new Promise(function (resolve, reject) {
    stream.once('close', resolve);
    stream.once('error', reject);
    stream.pipe(fs.createWriteStream(path));

    if (shouldUnZip) stream.pipe(unzipper.Extract({ path: tempDir }));

    return;
  });

const differentiatePhotos = Promise.coroutine(function*() {
  const somePhotoAlreadyExists = yield fs.readdirAsync(localPhotoDir);
  if(!_.size(somePhotoAlreadyExists)) {
    const photos = yield getPhotos(tempPhoto);
    return yield loadFtpImages(photos);
  }

  const newFile = yield fs.readFileAsync(tempPhoto, 'utf-8');
  const newPhotos = buildPhotoObject(splitData(newFile));
  const oldPhotos = yield getPhotos();
  const oldPhotosById = _.keyBy(oldPhotos, '_id');

  const photosToKeep = _.reduce(newPhotos, (acc, v) => {
    if (!v) return acc;

    const id = v._id;
    const oldObj = oldPhotosById[id];

    if (!oldObj) return _.concat(acc, v);
    if (oldObj.hash !== v.hash) return _.concat(acc, v);

    return acc;
  }, []);

  yield loadFtpImages(photosToKeep);
  return yield fs.copyFileAsync(tempPhoto, localPhotoPath);
});

const loadFtpData = Promise.coroutine(function* (req, res) {
  try {
    const ftp = new PromiseFtp();
    yield ftp.connect({ host, user, password });

    const dataStream = yield ftp.get(remoteDataPath);
    yield createFileFromStream(dataStream, localDataPath);
    const photoStream = yield ftp.get(remotePhotoPath);
    yield createFileFromStream(photoStream, tempZip, true);
    yield differentiatePhotos();

    yield ftp.end();

    return res.send(`retrieved and saved ${localDataPath} and ${localPhotoZipPath}`);
  } catch(err) {
    return res.send({
      message: `an error occured while trying to get ${localDataPath} and ${localPhotoZipPath}`,
      error
    });
  }
});

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

const getPhotos = Promise.coroutine(function* (givenPhotoPath) {
  const data = yield fs.readFileAsync(givenPhotoPath ? givenPhotoPath : localPhotoPath, 'utf-8');
  if (!data) return res.send(`Impossible de récupérer le fichier ${localPhotoPath}`);

  const photos = buildPhotoObject(splitData(data));

  return photos;
});

const loadImages = Promise.coroutine(function* (req, res) {
  const photos = yield getPhotos;
  const images = yield loadFtpImages(photos);

  console.log(`Retrieved ${_.size(images)} images from server`);

  return res.end();
});

const cleanPhotos = Promise.coroutine(function* (req, res) {
  const photosFile = yield getPhotos();
  const photoFileById = _.keyBy(photosFile, '_id');
  const photoJpeg = yield fs.readdirAsync(localPhotoDir);

  const deletedPhotos = [];
  yield Promise.mapSeries(photoJpeg, photo => {
    if (!photo) return;

    const photoName = _.replace(photo, '.jpg', '');
    if (!photoFileById[photoName]) {
      deletedPhotos.push(photo);
      return fs.unlinkAsync(`${localPhotoDir}/${photo}`);
    }
  });

  if (!_.size(deletedPhotos)) return res.send({
    message: 'Les photos ont été nettoyées avec succès, mais aucune n\'avait besoin d\'être effacée'
  });

  return res.send({
    message: `les photos ont été nettoyées avec succès. ${_.size(deletedPhotos)} photos ont été effacées. Voici la liste ci-dessous:`,
    'photos effacées: ': deletedPhotos
  });
});

module.exports = (app) => {
  app.get('/clean-photos', cleanPhotos);
  app.get('/load-ftp-data', loadFtpData);
  app.get('/get-annonces', getAnnonces);
  app.get('/load-images', loadImages);
  app.get('/get-photos', Promise.coroutine(function* (req, res) {
    return res.send(yield getPhotos());
  }));
}
