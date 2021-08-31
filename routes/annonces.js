'use strict';

const _ = require('lodash/fp');
const path = require('path');

const {
  cleanPhotos,
  getAnnonces,
  loadImages,
  getPhotos,
  getSingleAnnonce,
  getLatestAnnonces
} = require('../modules/data-handler');

const { setNoCache, clearAllCaches } = require('../modules/cache-handler');

const returnData = _.curry((res, data) => res.send(data));

module.exports = (app) => {
  app.get('/clean-photos', (req, res) => cleanPhotos().then(returnData(res)));
  app.get('/get-annonces', (req, res) => getAnnonces().then(returnData(res)));
  app.get('/get-annonce/:id', (req, res) => getSingleAnnonce(req).then(returnData(res)));
  app.get('/load-images', (req, res) => loadImages().then(returnData(res)));
  app.get('/get-photos', (req, res) => getPhotos().then(returnData(res)));
  app.get('/get-latest', (req, res) => getLatestAnnonces().then(returnData(res)));
  app.get('/clear-caches', (req, res) => {
    setNoCache(app, res);
    clearAllCaches(res);
  });
  app.get('/sitemap', (req, res) => res.sendFile(path.join(__dirname, '../sitemap.xml')));
}
