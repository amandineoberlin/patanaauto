'use strict';

const express = require('express');
const http = require('http');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const schedule = require('node-schedule');

const logger = require('./modules/logger');
const createImagesRoutes = require('./modules/create-images-routes');

const limit = '10mb';
const port = 5001;
const static_folder = path.join(__dirname, 'public/dist/patanaauto');

const app = express();
const server = http.createServer(app);

app.use(cookieParser());
app.use(bodyParser.json({ limit }));
app.use(bodyParser.urlencoded({ extended: true, limit }));

app.use('/', express.static(static_folder));

// cache all http requests for a month
app.get('*', (req, res, next) => {
  res.set('Cache-Control', 'public, max-age=2628000');
  return next();
})

require('./routes/annonces')(app);
require('./routes/emailer')(app);

schedule.scheduleJob({ hour: 1, minute: 1, dayOfWeek: 0, start: Date.now() }, () =>
  require('./modules/schedule-job').retrieveData());

schedule.scheduleJob({ hour: 1, minute: 1, date: 1, start: Date.now() }, () =>
  require('./modules/schedule-job').cleanData());

(async() => {
  await createImagesRoutes.load(app);
})();

server.listen(process.env.PORT || port, () => 
  logger.info('Node Express server for ' + app.name + ' listening on http://localhost:' + port));

app.emit('ready');
