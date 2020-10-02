const logger = require('./logger');

const clearAllCaches = (res) => {
  logger.info('requested cache cleaning');
  res.setHeader("Clear-Site-Data", "\"cache\", \"cookies\", \"storage\"");
  res.send({ success: true });
}

const setNoCache = (app, res) => {
  res.setHeader('Surrogate-Control', 'no-store');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  app.set('etag', false);
}

module.exports = { clearAllCaches, setNoCache };
