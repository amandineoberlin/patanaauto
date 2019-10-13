'use strict';

const PromiseFtp = require('promise-ftp');
const _ = require('lodash');
const Promise = require('bluebird');
const unzipper = require('unzipper')

const ftpget = Promise.promisifyAll(require('ftp-get'));
const fs = Promise.promisifyAll(require('fs'));
const xmlParser = Promise.promisifyAll(require('xml2js'));

const access = require('../config/access').ftp;
const logger = require('../modules/logger');

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
  const logMesg = `retrieved photos by differentiation`;
  const somePhotoAlreadyExists = yield fs.readdirAsync(localPhotoDir);
  if(!_.size(somePhotoAlreadyExists)) {
    const photoData = yield fs.readFileAsync(tempPhoto, 'utf-8');
    if (!photoData) return logger.error(`Impossible de récupérer le fichier ${tempPhoto}`);
    const photos = buildPhotoObject(splitData(photoData));
    yield loadFtpImages(photos);

    return logger.info(logMesg);
  }

  const newFile = yield fs.readFileAsync(tempPhoto, 'utf-8');
  const newPhotos = buildPhotoObject(splitData(newFile));
  const oldPhotos = yield getPhotosFromFile();
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
  yield fs.copyFileAsync(tempPhoto, localPhotoPath);

  return logger.info(logMesg);
});

const loadFtpData = Promise.coroutine(function* () {
  try {
    const ftp = new PromiseFtp();
    yield ftp.connect({ host, user, password });

    const dataStream = yield ftp.get(remoteDataPath);
    yield createFileFromStream(dataStream, localDataPath);
    const photoStream = yield ftp.get(remotePhotoPath);
    yield createFileFromStream(photoStream, tempZip, true);
    yield differentiatePhotos();

    yield ftp.end();

    return logger.info(`retrieved and saved ${localDataPath} and ${localPhotoZipPath}`);
  } catch(err) {
    logger.error({ err });
  }
});

const createAnnoncesIds = (annonces) => {
  return _.map(annonces, annonce => {
    annonce._id = `aaqv${annonce.VehiculeNumeroSerie}02ypu`;
    return annonce;
  })
};

const matchImagesWithAnnonces = (annonces, images) => {
  const match = _.reduce(images, (acc, k) => {
    const vehiculeEntity = _.get(k, '_id').split('_')[0];
    const name = _.get(k, 'name');
    acc[vehiculeEntity] ? acc[vehiculeEntity].push(name) : acc[vehiculeEntity] = [name];
    return acc;
  }, {});

  _.forEach(_.values(match), (key, index) => {
    annonces[index].images = key;
  }, []);
  
  return annonces;
}

const getAnnonces = Promise.coroutine(function* () {
  const data = yield fs.readFileAsync(localDataPath, 'utf-8');
  const json = data ? yield xmlParser.parseStringAsync(data) : null;
  const annonces = _.get(json, 'Stock.Vehicule');
  const images = yield getPhotosFromFile();
  const annoncesWithId = createAnnoncesIds(annonces);
  const annoncesWithImages = matchImagesWithAnnonces(annoncesWithId, images);

  logger.info(`retrieved ${_.size(annoncesWithImages)} annonces`);

  return annoncesWithImages;
});

const getSingleAnnonce = Promise.coroutine(function* (req) {
  const id = _.get(req, 'params.id');
  const annonces = yield getAnnonces();
  const singleAnnonce = _.find(annonces, { _id: id });
  
  if (!singleAnnonce) return logger.error(`cannot retrieve single annonce with id ${id}`);
  logger.info(`retrieved single annonce with id ${id}`);

  return singleAnnonce;
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
    .then(() => logger.info(`loaded ${_.size(photos)} images from ftp`))
})

const getPhotosFromFile = Promise.coroutine(function* () {
  const data = yield fs.readFileAsync(localPhotoPath, 'utf-8');
  if (!data) return logger.error(`Impossible de récupérer le fichier ${localPhotoPath}`);

  return buildPhotoObject(splitData(data));
});

const getPhotos = Promise.coroutine(function* () {
  const photos = yield getPhotosFromFile();
  logger.info(`retrieved ${_.size(photos)} photos`);

  return photos;
});

const loadImages = Promise.coroutine(function* () {
  const photos = yield getPhotosFromFile();
  const images = yield loadFtpImages(photos);

  return logger.info(`Retrieved ${_.size(images)} images from server`);
});

const cleanPhotos = Promise.coroutine(function* () {
  const photosFile = yield getPhotosFromFile();
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

  if (!_.size(deletedPhotos)) return logger.info({
    message: 'Les photos ont été nettoyées avec succès, mais aucune n\'avait besoin d\'être effacée'
  });

  return logger.info({
    message: `les photos ont été nettoyées avec succès. ${_.size(deletedPhotos)} photos ont été effacées. Voici la liste ci-dessous:`,
    'photos effacées: ': deletedPhotos
  });
});

module.exports = {
  cleanPhotos,
  loadFtpData,
  getAnnonces,
  loadImages,
  getPhotos,
  getSingleAnnonce
};
