'use strict';

const express = require('express');
const http = require('http');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const schedule = require('node-schedule');
const logger = require('./modules/logger');

const limit = '10mb';
const port = 5001;
const static_folder = path.join(__dirname, 'dist/patanaauto');

const app = express();
const server = http.createServer(app);

app.use(cookieParser());
app.use(bodyParser.json({ limit }));
app.use(bodyParser.urlencoded({ extended: true, limit }));

app.use('/', express.static(static_folder));

require('./routes/annonces')(app);

schedule.scheduleJob({ hour: 00, minute: 00, dayOfWeek: 0, start: Date.now() }, () =>
  require('./modules/schedule-job').retrieveData());

schedule.scheduleJob({ hour: 00, minute: 00, date: 1, start: Date.now() }, () =>
  require('./modules/schedule-job').cleanData());

server.listen(port, () => 
  logger.info('Node Express server for ' + app.name + ' listening on http://localhost:' + port));

app.emit('ready');
