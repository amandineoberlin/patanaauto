'use strict';

const Promise = require('bluebird');

const logger = require('./logger');

const { cleanPhotos, loadFtpData } = require('./data-handler');

const retrieveData = Promise.coroutine(function* () {
  logger.info('scheduler for data loading launched...')
  yield loadFtpData();
});

const cleanData = Promise.coroutine(function* () {
  logger.info('scheduler for data cleaning launched...')
  yield cleanPhotos();
});

module.exports = {
  retrieveData,
  cleanData
};
