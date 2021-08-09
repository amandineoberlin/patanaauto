'use strict';

const PromiseFtp = require('promise-ftp');
const _ = require('lodash');
const Promise = require('bluebird');
const unzipper = require('unzipper');
const path = require('path');
const sharp = require("sharp");
const moment = require('moment');

const ftpget = Promise.promisifyAll(require('ftp-get'));
const fs = Promise.promisifyAll(require('fs'));
const xmlParser = Promise.promisifyAll(require('xml2js'));

const access = require('../config/access');
const logger = require('./logger');

const { host, user, password, connTimeout } = access.ftp;

const buildImageFtpUrl = dir => `ftp://${user}:${password}@ftp.publicationvo.com${dir}`;
const splitData = data => data.toString().split('\n');

const TODAY = moment().format('DD-MM-YYYY');

const remoteDataFile = '/datas/acaa.xml';
const remotePhotoFile = '/datas/photos.txt.zip';
const localDir = path.join(__dirname, '../selsia-data');

const oldDir = `${localDir}/old`;
const oldPhotoFile = `${oldDir}/photos.txt`;

const newDir = `${localDir}/new`;
const newDataFile = `${newDir}/acaa.xml`;
const newPhotoDir = `${newDir}/photos`;
const newPhotoFile = `${newDir}/photos.txt`;
const newPhotoZipFile = `${newDir}/photos.txt.zip`;

// workaround because the synchronous exist function has an error as its first parameter
fs.existsAsync = Promise.promisify
(function exists2(path, exists2callback) {
    fs.exists(path, function callbackWrapper(exists) { exists2callback(null, exists); });
 });
 
const createFileFromStream = (stream, path, shouldUnZip, extractPath) =>
  new Promise((resolve, reject) => {
    stream.once('close', resolve);
    stream.once('error', reject);
    stream.pipe(fs.createWriteStream(path));

    if (shouldUnZip) stream.pipe(unzipper.Extract({ path: extractPath }));
  });

const loadFtpData = async() => {
  const ftp = new PromiseFtp();
  await ftp.connect({ host, user, password, connTimeout });
  logger.info(`connected to ftp`);

  const dataStream = await ftp.get(remoteDataFile);
  logger.info(`Retrieved ftp path ${remoteDataFile}`);

  await createFileFromStream(dataStream, newDataFile);
  logger.info(`created data file from stream`);
  
  const xmlData = await fs.readFileAsync(newDataFile, 'utf-8');
  const dataToJson = await xmlParser.parseStringAsync(xmlData);
  const jsonToSave = JSON.stringify(_.get(dataToJson, 'Stock.Vehicule', {}));
  await fs.writeFileAsync(`${newDir}/${TODAY}.json`, jsonToSave);
  logger.info(`Created json data file ${newDir}/${TODAY}.json`);

  const photoStream = await ftp.get(remotePhotoFile);
  logger.info(`Retrieved ftp path ${remotePhotoFile}`);

  const photoFileAlreadyExists = await fs.existsAsync(newPhotoFile);
  if (photoFileAlreadyExists) await fs.renameAsync(newPhotoFile, oldPhotoFile);
  logger.info(`moved already existing ${newPhotoFile} to ${oldPhotoFile}`);

  await createFileFromStream(photoStream, newPhotoZipFile, true, newDir);
  logger.info(`created photo zip file from stream`);

  await downloadPhotos();
  await fs.unlinkAsync(newPhotoZipFile);
  logger.info(`removed ${newPhotoZipFile}`);
};

const downloadPhotos = async () => {
  const existingOldPhotos = await fs.existsAsync(oldPhotoFile);
  const logMesg = `downloaded photos${existingOldPhotos ? 'by differentiation.' : '.'}`;

  const photos = await getPhotosFromFile(newPhotoFile);

  if (!existingOldPhotos) {
    await getAndSaveFtpImages(photos);
    logger.info(logMesg);
    return;
  }

  const oldPhotos = await getPhotosFromFile(oldPhotoFile);
  if (_.size(photos) === _.size(oldPhotos)) {
    logger.info('No difference between old and new photos');
    return;
  }

  const oldPhotosById = _.keyBy(oldPhotos, '_id');
  const photosNeedingDownload = _.reduce(photos, (acc, v) => {
    if (!v) return acc;

    const id = v._id;
    const oldObj = oldPhotosById[id];

    if (!oldObj) return _.concat(acc, v);
    if (oldObj.hash !== v.hash) return _.concat(acc, v);

    return acc;
  }, []);

  await getAndSaveFtpImages(photosNeedingDownload);
  logger.info(logMesg);
};

const createAnnoncesIdsAndTitle = (annonces) => {
  return _.map(annonces, (annonce) => {
    const marque = annonce.VehiculeMarque[0];
    const modele = annonce.VehiculeModele[0];

    annonce.title = marque === modele ? marque : `${marque} ${modele}`;
    annonce._id = `aaqv${annonce.VehiculeNumeroSerie}02ypu`;

    return annonce;
  });
};

const matchImagesWithAnnonces = (annonces, images) => {
  const imagesByBase = _.groupBy(images, 'base');
  const basesArray = _.uniq(_.map(images, 'base'));

  _.forEach(basesArray, (key, index) => {
    if (annonces[index]) annonces[index].images = _.map(imagesByBase[key], 'name');
  });
  
  return annonces;
};

const getAnnonces = async () => {
  const fileList = await fs.readdirAsync(newDir);
  const jsonFileName = fileList.find(v => /.json/.test(v));
  if (!jsonFileName) {
    logger.info(`No existing data json file`);
    return [];
  }

  const rawdata = await fs.readFileAsync(`${newDir}/${jsonFileName}`);
  const images = await getPhotosFromFile(newPhotoFile);
  const annoncesWithId = createAnnoncesIdsAndTitle(JSON.parse(rawdata));
  const annoncesWithImages = matchImagesWithAnnonces(annoncesWithId, images);

  logger.info(`retrieved ${_.size(annoncesWithImages)} annonces`);

  return annoncesWithImages;
};

const getSingleAnnonce = Promise.coroutine(function* (req) {
  const id = _.get(req, 'params.id');
  const annonces = yield getAnnonces();
  const singleAnnonce = _.find(annonces, { _id: id });
  
  if (!singleAnnonce) {
    const noAddMess = `cannot retrieve single annonce with id ${id}`;
    logger.error({ data: noAddMess });
    return Promise.resolve(noAddMess);
  };

  const message = `retrieved single annonce with id ${id}`;
  logger.info(message);

  return Promise.resolve(singleAnnonce);
});

const buildPhotoObject = photos => _.reduce(photos, (acc, value) => {
  if (!value) return acc;

  const [name, directory, hash] = _.split(_.trim(value), '\t');
  const [base] = _.split(name, '_');
  const info = { _id: _.replace(name, '.jpg', ''), name, base, directory, hash };

  return _.concat(acc, info);
}, []);

const getAndSaveFtpImages = (photos) =>
  Promise.mapSeries(photos, (p) => {
    const url = buildImageFtpUrl(p.directory);
    return ftpget
      .getAsync({ url, bufferType: 'buffer' })
      .then((buffer) => {
        logger.info(`Downloaded a photo (${p.name})`);

        // compress image to reduce size in frontend
        return sharp(buffer)
          .resize(800)
          .jpeg({ quality: 70 })
          .toFile(`${newPhotoDir}/${p.name}`);
      })
      .catch(() => logger.info(`Photo: ${p.name} could not be retrieved`));
  });

const getPhotosFromFile = Promise.coroutine(function* (path) {
  const data = yield fs.readFileAsync(path, 'utf-8');
  if (!data) return logger.error(`could not retrieve photo file: ${path}`);

  return buildPhotoObject(splitData(data));
});

const getPhotos = Promise.coroutine(function* () {
  const fileExists = yield fs.existsAsync(newPhotoFile);
  if (!fileExists) {
    logger.info(`Could not retrieve ${newPhotoFile} because it does not exists`);
    return [];
  }

  const photos = yield getPhotosFromFile(newPhotoFile);
  logger.info(`retrieved ${_.size(photos)} photos`);

  return photos;
});

const loadImages = Promise.coroutine(function* () {
  const photos = yield getPhotosFromFile(newPhotoFile);
  const images = yield getAndSaveFtpImages(photos);

  return logger.info(`Retrieved ${_.size(images)} images from ftp`);
});

const cleanPhotos = Promise.coroutine(function* () {
  const photoFile = yield getPhotosFromFile(newPhotoFile);
  const photoFileById = _.keyBy(photoFile, '_id');
  const photos = yield fs.readdirAsync(newPhotoDir);

  const deletedPhotos = [];
  yield Promise.mapSeries(photos, (photo) => {
    if (!photo) return;
    const photoName = _.replace(photo, '.jpg', '');
    const photoExistsInFile = photoFileById[photoName];
    if (photoExistsInFile) return null;
    const fileExtension = path.extname(photo);
    if (!_.includes(['.jpg', '.jpeg', '.JPG', '.JPEG'], fileExtension)) return null;
    deletedPhotos.push(photo);
    return fs.unlinkAsync(`${newPhotoDir}/${photo}`);
  });

  const message = _.isEmpty(deletedPhotos) ?
    'Les photos ont été nettoyées avec succès, mais aucune n\'avait besoin d\'être effacée' :
    `les photos ont été nettoyées avec succès. ${_.size(deletedPhotos)}`+
    ` photos ont été effacées. Voici la liste ci-dessous:` +
    ` photos effacées: ${deletedPhotos}`;

  logger.info({ message });

  return;
});

const getLatestAnnonces = async () => {
  const newAnnonces = await getAnnonces(newDataFile);
  if (!newAnnonces) {
    logger.info('getLatestAnnonces: no new annonces');
    return [];
  }

  const ordered = _.orderBy(newAnnonces, (annonce) => _.split(annonce.images[0], '_', 1), 'DESC');

  // always return the latest 6 annonces, given the fact that the file is ordered by default
  return ordered.slice(ordered.length - 6).reverse();
};

module.exports = {
  cleanPhotos,
  loadFtpData,
  getAnnonces,
  loadImages,
  getPhotos,
  getSingleAnnonce,
  getLatestAnnonces
};
