'use strict';

const _ = require('lodash/fp');

const {
  cleanPhotos,
  loadFtpData,
  getAnnonces,
  loadImages,
  getPhotos,
  getSingleAnnonce,
  getLatestAnnonces,
  deleteAll
} = require('../modules/data-handler');

const returnData = _.curry((res, data) => res.send(data));

const setNoCache = (app, res) => {
  res.setHeader('Surrogate-Control', 'no-store');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  app.set('etag', false);
}

module.exports = (app) => {
  app.get('/clean-photos', (req, res) => cleanPhotos().then(returnData(res)));
  app.get('/load-ftp-data', (req, res) => loadFtpData(res));
  app.get('/get-annonces', (req, res) => {
    setNoCache(app, res);
    return getAnnonces().then(returnData(res));
  });
  app.get('/get-annonce/:id', (req, res) => getSingleAnnonce(req).then(returnData(res)));
  app.get('/load-images', (req, res) => loadImages().then(returnData(res)));
  app.get('/get-photos', (req, res) => getPhotos().then(returnData(res)));
  app.get('/get-latest', (req, res) => getLatestAnnonces().then(returnData(res)));
  app.get('/delete-all', deleteAll);
}
