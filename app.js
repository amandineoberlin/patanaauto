'use strict';

console.log('partOONE')

const express = require('express');
const http = require('http');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const schedule = require('node-schedule');

const limit = '10mb';
const port = 5001;
const static_folder = path.join(__dirname, 'dist/patanaauto');

const app = express();
const server = http.createServer(app);

app.use(cookieParser());
app.use(bodyParser.json({ limit }));
app.use(bodyParser.urlencoded({ extended: true, limit }));
console.log('partTWWWOOOO')

app.use('/', express.static(static_folder));

require('./routes/annonces')(app);
require('./routes/emailer')(app);

schedule.scheduleJob({ hour: 1, minute: 1, dayOfWeek: 0, start: Date.now() }, () =>
  require('./modules/schedule-job').retrieveData());

schedule.scheduleJob({ hour: 1, minute: 1, date: 1, start: Date.now() }, () =>
  require('./modules/schedule-job').cleanData());

server.listen(port, () => 
  console.log('Node Express server for ' + app.name + ' listening on http://localhost:' + port));

app.emit('ready');
