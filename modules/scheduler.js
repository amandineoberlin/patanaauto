'use strict';
const logger = require('./logger');
const { cleanPhotos, loadFtpData } = require('./data-handler');

const retrieveData = async () => {
  logger.info('scheduler for data loading launched...');
  await loadFtpData();
};

const cleanData = async () => {
  logger.info('scheduler for data cleaning launched...');
  await cleanPhotos();
};

const launch = async () => {
  try {
    await retrieveData();
    await cleanData();
    logger.info('Data daily routine completed with success!');
  } catch (e) {
    logger.error(`An error occured while running ftp scheduler job: `, e);
  }
};

// (async () => await launch())();
