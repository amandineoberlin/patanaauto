'use strict';

const _ = require('lodash/fp');

const {
  cleanPhotos,
  loadFtpData,
  getAnnonces,
  loadImages,
  getPhotos,
  getSingleAnnonce
} = require('../modules/data-handler');

const returnData = _.curry((res, data) => res.send(data));

module.exports = (app) => {
  app.get('/clean-photos', (req, res) => cleanPhotos().then(returnData(res)));
  app.get('/load-ftp-data', (req, res) => loadFtpData().then(returnData(res)));
  app.get('/get-annonces', (req, res) => getAnnonces().then(returnData(res)));
  app.get('/get-annonce/:id', (req, res) => getSingleAnnonce(req).then(returnData(res)));
  app.get('/load-images', (req, res) => loadImages().then(returnData(res)));
  app.get('/get-photos', (req, res) => getPhotos().then(returnData(res)));
}
