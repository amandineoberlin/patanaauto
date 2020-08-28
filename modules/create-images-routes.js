'use strict';
const _ = require('lodash');
const path = require('path');

const { getPhotos } = require('./data-handler');

const localPhotosDir = 'selsia-data/new/photos';

const load = async(app) => {
  const images = await getPhotos();
  if (_.isEmpty(images)) return Promise.resolve();

  const names = _.map(images, i => i.name);

  await Promise.all(_.map(names, n =>
    app.get(`/${n}`, (req, res) => 
      res.sendFile(path.resolve(`${localPhotosDir}/${n}`)))));
}

module.exports = { load };
