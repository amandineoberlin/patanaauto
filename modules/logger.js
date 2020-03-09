const env = require('../environment');
const bunyan = require('bunyan');

const prodLogger = bunyan.createLogger({
  name: 'Patana Auto',
  streams: [
    {
      level: 'error',
      path: 'bunyan-logs/errors.log'
    },
    {
      level: 'fatal',
      path: 'bunyan-logs/errors.log'
    },
    {
      level: 'info',
      path: 'bunyan-logs/infos.log'
    },
    {
      level: 'warn',
      path: 'bunyan-logs/infos.log'
    },
    {
      level: 'debug',
      path: 'bunyan-logs/infos.log'
    },
    {
      level: 'trace',
      path: 'bunyan-logs/infos.log'
    },
  ]
});

const devLogger = bunyan.createLogger({ name: 'Patana Auto' });

module.exports = env === 'dev' ? devLogger : prodLogger;
