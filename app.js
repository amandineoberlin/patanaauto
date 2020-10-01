'use strict';

const express = require('express');
const http = require('http');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const schedule = require('node-schedule');
const compression = require('compression');

const logger = require('./modules/logger');

const limit = '10mb';
const port = 5001;
const static_folder = path.join(__dirname, 'src/dist/patanaauto');

const app = express();
app.use(compression());
const server = http.createServer(app);

app.use(cookieParser());
app.use(bodyParser.json({ limit }));
app.use(bodyParser.urlencoded({ extended: true, limit }));

app.use('/', express.static(static_folder));

app.use('/photos', express.static(__dirname + '/selsia-data/new/photos'));

// cache all http requests for a month
app.get('*', (req, res, next) => {
  res.set('Cache-Control', 'public, max-age=2628000');
  return next();
});

require('./routes/annonces')(app);
require('./routes/emailer')(app);

// schedule ftp load every sunday at 2.30am
schedule.scheduleJob({ hour: 2, minute: 30, dayOfWeek: 0 }, async () => {
  logger.info(`FTP job scheduler launched! Date: ${new Date()}`);
  await require('./modules/schedule-job').retrieveData();
  await require('./modules/schedule-job').cleanData();
});

// test job every thursday at 12.30am
schedule.scheduleJob({ hour: 12, minute: 30, dayOfWeek: 4 }, async () => {
  logger.info(`TEST FTP job scheduler of thursday launched! Date: ${new Date()}`);
});

server.listen(process.env.PORT || port, () => 
  logger.info('Node Express server for ' + app.name + ' listening on http://localhost:' + port));

app.emit('ready');
