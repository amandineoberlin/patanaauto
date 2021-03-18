'use strict';

const express = require('express');
const http = require('http');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cron = require('node-cron');
const compression = require('compression');

const logger = require('./modules/logger');
const scheduler = require('./modules/scheduler');

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

require('./modules/async-exists');

// schedule ftp load every day at 23:00pm
// usage is not nice but when using cron.schedule('59 23 * * *') it didnt work on heroku
// although it did work locally. So this is a workaround
cron.schedule('30 01 * * mon', async () => {
  logger.info(`Daily FTP job scheduler launched! Date: ${new Date()}`);
  await scheduler.launch();
});
cron.schedule('30 01 * * tue', async () => {
  logger.info(`Daily FTP job scheduler launched! Date: ${new Date()}`);
  await scheduler.launch();
});
cron.schedule('30 01 * * wed', async () => {
  logger.info(`Daily FTP job scheduler launched! Date: ${new Date()}`);
  await scheduler.launch();
});
cron.schedule('30 01 * * fri', async () => {
  logger.info(`Daily FTP job scheduler launched! Date: ${new Date()}`);
  await scheduler.launch();
});
cron.schedule('30 01 * * sat', async () => {
  logger.info(`Daily FTP job scheduler launched! Date: ${new Date()}`);
  await scheduler.launch();
});
cron.schedule('30 01 * * sun', async () => {
  logger.info(`Daily FTP job scheduler launched! Date: ${new Date()}`);
  await scheduler.launch();
});

server.listen(process.env.PORT || port, () => 
  logger.info('Node Express server for ' + app.name + ' listening on http://localhost:' + port));

server.timeout = 240000;

app.emit('ready');
