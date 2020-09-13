'use strict';

const express = require('express');
const http = require('http');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const schedule = require('node-schedule');
const compression = require('compression');
const _ = require('lodash');

const logger = require('./modules/logger');
const createImagesRoutes = require('./modules/create-images-routes');

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

// cache all http requests for a month
app.get('*', (req, res, next) => {
  res.set('Cache-Control', 'public, max-age=2628000');
  return next();
})

require('./routes/annonces')(app);
require('./routes/emailer')(app);

// schedule ftp load every sunday at 2am
const rule = new schedule.RecurrenceRule();
_.assign(rule, {
  second: 0,
  minute: 0,
  hour: 2,
  dayOfWeek: 0
});
 
schedule.scheduleJob(rule, async () => {
  logger.info(`FTP job scheduler launched! Date: ${new Date()}`);
  await require('./modules/schedule-job').retrieveData();
  await require('./modules/schedule-job').cleanData();
});

/* TODO: remove (test scheduler)
   Testing if there is indeed a log every 5 minutes
*/
const testRule = new schedule.RecurrenceRule();
_.assign(testRule, {
  second: 0,
  minute: 0,
  hour: 2,
  dayOfWeek: 0
});
schedule.scheduleJob(testRule, async () => {
  logger.info(`TEST JOB LAUNCHED! Date: ${new Date()}`);
});
/* END OF TEST TO DELETE */

(async() => {
  await createImagesRoutes.load(app);
})();

server.listen(process.env.PORT || port, () => 
  logger.info('Node Express server for ' + app.name + ' listening on http://localhost:' + port));

app.emit('ready');
