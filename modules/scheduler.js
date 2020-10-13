'use strict';

const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const path = require('path');
const Queue = require('bull');

const logger = require('./logger');
const { cleanPhotos, loadFtpData } = require('./data-handler');
const access = require('../config/access');

const versionFilePath = path.join(__dirname + '/../src/assets/annonces-version.json');

const { REDIS_URL } = access.redis;
const HASH_LENGTH = 10;
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const generateHash = (date) => {
  const random = Math.random().toString(36).substring(2, 15);
  const charset = ALPHABET.match(/./g);
  let hash = 0;
  let text = '';

  for (let i = 0; i < HASH_LENGTH; i++) {
    text += charset[Math.floor(Math.random() * charset.length)];
  }

  for (let i = 0; i < HASH_LENGTH; i++) {
    const chr = date.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    // Convert to 32bit integer
    hash |= 0;
  }

  return `${text}${hash}${random}`;
};

const retrieveData = async () => {
  logger.info('scheduler for data loading launched...');
  await loadFtpData();
};

const cleanData = async () => {
  logger.info('scheduler for data cleaning launched...');
  await cleanPhotos();
};

const handleVersion = async () => {
  logger.info('scheduler for version handling launched...');

  try {
    let version;
    const versionFileExists = await fs.existsAsync(versionFilePath);

    if (versionFileExists) {
      const currentVersionBuffer = await fs.readFileAsync(versionFilePath);
      const currentData = JSON.parse(currentVersionBuffer);
      version = currentData.version ? parseInt(currentData.version) : 0;
    } else {
      version = 0;
    }

    const dateValue = new Date().valueOf().toString();
    const newHash = generateHash(dateValue);
    const src = `{"version": "${version + 1}", "hash": "${newHash}"}`;
    await fs.writeFileAsync(versionFilePath, src);
    logger.info('Handled the new annonces version with success!');
    return;
  } catch (e) {
    logger.error(`An error occured while handling the new annonces version: ${e}`);
  }
};

const launch = async () => {
  const queue = new Queue('ftp data queue', REDIS_URL);

  queue.process(async(job, done) => {
    logger.info(`started scheduler job: ${job.data}`);
    try {
      await retrieveData();
      await cleanData();
      await handleVersion();
      return done();
    } catch (e) {
      logger.error(`An error occured while running ftp scheduler job: `, e);
      return done(new Error(e));
    }
  });

  await queue.add();

  queue.on('completed', () => {
    return logger.info('scheduler data completed with success');
  });
};

module.exports = { launch };
