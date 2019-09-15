const env = require('../environment');
const bunyan = require('bunyan');

const prodLogger = bunyan.createLogger({
  name: 'Patana Auto',
  streams: [
    {
      level: 'error',
      path: 'logs/errors.log'
    },
    {
      level: 'fatal',
      path: 'logs/errors.log'
    },
    {
      level: 'info',
      path: 'logs/infos.log'
    },
    {
      level: 'warn',
      path: 'logs/infos.log'
    },
    {
      level: 'debug',
      path: 'logs/infos.log'
    },
    {
      level: 'trace',
      path: 'logs/infos.log'
    },
  ]
});

const devLogger = bunyan.createLogger({ name: 'Patana Auto' });

module.exports = env === 'dev' ? devLogger : prodLogger;
