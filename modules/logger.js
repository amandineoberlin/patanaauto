'use strict';

const { createLogger, format, transports } = require('winston');

const logger = createLogger({
  format: format.json(),
  transports: [ new transports.Console() ]});

module.exports = {
  error: (m) => logger.log('error', m),
  warn: (m) => logger.log('warn', m),
  info: (m) => logger.log('info', m),
  verbose: (m) => logger.log('verbose', m),
  debug: (m) => logger.log('debug', m)
}
