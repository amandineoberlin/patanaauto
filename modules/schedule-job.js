'use strict';

const Promise = require('bluebird');

const logger = require('./logger').createLogger();

const {
  cleanPhotos,
  loadFtpData,
  getPhotos
} = require('./data-handler');

const retrieveData = Promise.coroutine(function* () {
  logger.info('scheduler for data loading launched...')

  yield loadFtpData();
  yield getPhotos();
});

const cleanData = Promise.coroutine(function* () {
  logger.info('scheduler for data cleaning launched...')
  yield cleanPhotos();
});

module.exports = {
  retrieveData,
  cleanData
};
