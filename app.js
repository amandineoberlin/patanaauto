'use strict';

const express = require('express');
const http = require('http');
const path = require('path');
const cookieParser = require('cookie-parser');
const compression = require('compression');

const logger = require('./modules/logger');

const limit = '10mb';
const port = 5001;
const static_folder = path.join(__dirname, 'src/dist/patanaauto');

const app = express();
app
  .use(express.urlencoded({ extended: true, limit }))
  .use(compression())
  .use(express.json())
  .use(cookieParser());

const server = http.createServer(app);

app.use('/', express.static(static_folder));

app.use('/photos', express.static(__dirname + '/selsia-data/new/photos'));

// cache all http requests for a month
app.get('*', (req, res, next) => {
  res.set('Cache-Control', 'public, max-age=2628000');
  return next();
});

require('./routes/annonces')(app);
require('./routes/emailer')(app);

require('./modules/async-exists');
require('./modules/scheduler');

server.listen(process.env.PORT || port, () => 
  logger.info('Node Express server for ' + app.name + ' listening on http://localhost:' + port));

server.timeout = 240000;

app.emit('ready');
