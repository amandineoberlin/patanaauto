'use strict';

const PromiseFtp = require('promise-ftp');
const _ = require('lodash');
const Promise = require('bluebird');
const unzipper = require('unzipper');
const path = require('path');
const Queue = require('bull');

const ftpget = Promise.promisifyAll(require('ftp-get'));
const fs = Promise.promisifyAll(require('fs'));
const xmlParser = Promise.promisifyAll(require('xml2js'));

const access = require('../config/access');
const logger = require('./logger');

const { host, user, password, connTimeout } = access.ftp;
const { REDIS_URL } = access.redis;

const buildImageFtpUrl = dir => `ftp://${user}:${password}@ftp.publicationvo.com${dir}`;
const splitData = data => data.toString().split('\n');

const remoteDataFile = '/datas/acaa.xml';
const remotePhotoFile = '/datas/photos.txt.zip';
const localDir = path.join(__dirname, '../selsia-data');

const oldDir = `${localDir}/old`;
const oldDataFile = `${oldDir}/acaa.xml`;
const oldPhotoFile = `${oldDir}/photos.txt`;
const oldPhotoZipFile = `${oldDir}/photos.txt.zip`;

const newDir = `${localDir}/new`;
const newDataFile = `${newDir}/acaa.xml`;
const newPhotoDir = `${newDir}/photos`;
const newPhotoFile = `${newDir}/photos.txt`;
const newPhotoZipFile = `${newDir}/photos.txt.zip`;

fs.isFileExists = Promise.promisify
(function exists2(path, exists2callback) {
  fs.exists(path, function callbackWrapper(exists) { exists2callback(null, exists); });
});

const loadFtpData = async(res) => {
  const ftpQueue = new Queue('ftp queue', REDIS_URL);
  await ftpQueue.add();

  ftpQueue.process(async(job, done) => {
    try {
      const ftp = new PromiseFtp();
      await ftp.connect({ host, user, password, connTimeout });
      logger.info(`connected to ftp`);

      const dataStream = await ftp.get(remoteDataFile);
      logger.info(`Retrieved ftp path ${remoteDataFile}`);

      const dataFileAlreadyExists = await fs.existsAsync(newDataFile);
      if (dataFileAlreadyExists) {
        const isOldFolderExists = await fs.existsAsync(oldDir);
        if (!isOldFolderExists) await fs.mkdirAsync(oldDir);
        await fs.renameAsync(newDataFile, oldDataFile);
        logger.info(`moved already existing data file to folder: \'old\'`);
      }

      await createFileFromStream(dataStream, newDataFile);
      logger.info(`created data file from stream`);

      const photoStream = await ftp.get(remotePhotoFile);
      logger.info(`Retrieved ftp path ${remotePhotoFile}`);

      const photoFileAlreadyExists = await fs.existsAsync(newPhotoFile);
      const photoZipFileAlreadyExists = await fs.existsAsync(newPhotoZipFile);
      if (photoFileAlreadyExists) await fs.renameAsync(newPhotoFile, oldPhotoFile);
      if (photoZipFileAlreadyExists) {
        await fs.renameAsync(newPhotoZipFile, oldPhotoZipFile);
        logger.info(`moved already existing photo files to folder: \'old\'`);
      }

      await createFileFromStream(photoStream, newPhotoZipFile, true, newDir);
      logger.info(`created photo file from stream`);

      // await downloadPhotos();
      // await cleanPhotos();

      logger.info(`retrieved and saved ${newDataFile}, ${newPhotoZipFile}, ${newPhotoFile}`);

      done(await ftp.end());

    } catch (e) {
      logger.error(`An error occured while running ftp job: `, e);
      done(new Error(e));
    }
  });

  ftpQueue.on('completed', async() => {
    logger.info('ftp completed')
  });

  return res.send('ftp processing...');
};

const createFileFromStream = (stream, path, shouldUnZip, extractPath) =>
  new Promise((resolve, reject) => {
    stream.once('close', resolve);
    stream.once('error', reject);
    stream.pipe(fs.createWriteStream(path));

    if (shouldUnZip) stream.pipe(unzipper.Extract({ path: extractPath }));
  });

const downloadPhotos = Promise.coroutine(function*() {
  const existingOldPhotos = yield fs.existsAsync(oldPhotoFile);
  const logMesg = `downloaded photos${existingOldPhotos ? 'by differentiation.' : '.'}`;

  const photos = yield getPhotosFromFile(newPhotoFile);

  if (!existingOldPhotos) {
    yield getAndSaveFtpImages(photos);
    return logger.info(logMesg);
  }

  const oldPhotos = yield getPhotosFromFile(oldPhotoFile);
  if (_.size(photos) === _.size(oldPhotos)) return logger.info('No difference between old and new photos');

  const oldPhotosById = _.keyBy(oldPhotos, '_id');

  const photosNeedingDownload = _.reduce(photos, (acc, v) => {
    if (!v) return acc;

    const id = v._id;
    const oldObj = oldPhotosById[id];

    if (!oldObj) return _.concat(acc, v);
    if (oldObj.hash !== v.hash) return _.concat(acc, v);

    return acc;
  }, []);

  yield getAndSaveFtpImages(photosNeedingDownload);

  return logger.info(logMesg);
});

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

const getJsonAnnonces = Promise.coroutine(function* (path) {
  const isData = yield fs.existsAsync(path);
  if (!isData) return Promise.resolve(null);

  const data = yield fs.readFileAsync(path, 'utf-8');
  const json = yield xmlParser.parseStringAsync(data);
  return _.get(json, 'Stock.Vehicule');
});

const getAnnonces = Promise.coroutine(function* () {
  const annonces = yield getJsonAnnonces(newDataFile);
  const images = yield getPhotosFromFile(newPhotoFile);
  const annoncesWithId = createAnnoncesIdsAndTitle(annonces);
  const annoncesWithImages = matchImagesWithAnnonces(annoncesWithId, images);

  logger.info(`retrieved ${_.size(annoncesWithImages)} annonces`);

  return Promise.resolve(annoncesWithImages);
});

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

  return Promise.resolve(message);
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
        return fs.writeFileAsync(`${newPhotoDir}/${p.name}`, buffer, 'binary');
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

  return message;
});

const getLatestAnnonces = Promise.coroutine(function* () {
  const oldAnnonces = yield getJsonAnnonces(oldDataFile);
  if (!oldAnnonces) {
    logger.info('getLatestAnnonces: no old annonces');
    return Promise.resolve([]);
  }
  const newAnnonces = yield getJsonAnnonces(newDataFile);
  if (!newAnnonces) {
    logger.info('getLatestAnnonces: no new annonces');
    return Promise.resolve([]);
  }

  const oldImmatriculations = _.flatMap(oldAnnonces, 'VehiculeImmatriculation');
  const lastestAnnonces = _.reduce(newAnnonces, (acc, v) => {
    if (!v) return acc;

    const newImmatriculation = v.VehiculeImmatriculation[0];
    const existsInOldAnnonces = _.includes(oldImmatriculations, newImmatriculation);

    return !existsInOldAnnonces ? _.concat(acc, v) : acc;
  }, []);

  logger.info(`Retrieved ${_.size(lastestAnnonces)} latest annonces`);

  return Promise.resolve(lastestAnnonces);
});

const deleteAll = async(req, res) => {
  const deleteQueue = new Queue('delete queue', REDIS_URL);
  await deleteQueue.add();

  deleteQueue.process(async(job, done) => {
    try {
      if (yield fs.existsAsync(oldDataFile)) {
        await fs.unlinkAsync(oldDataFile);
        logger.info(`Deleted file: ${oldDataFile}`)
      }
      if (yield fs.existsAsync(newDataFile)) {
        await fs.unlinkAsync(newDataFile);
        logger.info(`Deleted file: ${newDataFile}`)
      }
      if (yield fs.existsAsync(oldPhotoFile)) {
        await fs.unlinkAsync(oldPhotoFile);
        logger.info(`Deleted file: ${oldPhotoFile}`)
      }
      if (yield fs.existsAsync(newPhotoFile)) {
        await fs.unlinkAsync(newPhotoFile);
        logger.info(`Deleted file: ${newPhotoFile}`)
      }
      if (yield fs.existsAsync(oldPhotoZipFile)) {
        await fs.unlinkAsync(oldPhotoZipFile);
        logger.info(`Deleted file: ${oldPhotoZipFile}`)
      }
      if (yield fs.existsAsync(newPhotoZipFile)) {
        await fs.unlinkAsync(newPhotoZipFile);
        logger.info(`Deleted file: ${newPhotoZipFile}`)
      }

      const newFiles = await fs.readdirAsync(newPhotoDir);
      if (!_.isEmpty(newFiles)) {
        for (const newFile of newFiles) {
          const newPath = path.join(newPhotoDir, newFile);
          const newFileExists = yield fs.existsAsync(newPath);
          if (newFileExists) {
            logger.info(`deleting photo: ${newPath}`);
            await fs.unlinkAsync(newPath);
          }
        }
      }

      done();
    } catch(e) {
      logger.error(`error while deleting files . ${e}`);
      done(e);
    }
  });

  deleteQueue.on('completed', async() => {
    logger.info('deletion completed');
  });

  return res.send('data is being deleted....');
};

module.exports = {
  cleanPhotos,
  loadFtpData,
  getAnnonces,
  loadImages,
  getPhotos,
  getSingleAnnonce,
  getLatestAnnonces,
  deleteAll
};
