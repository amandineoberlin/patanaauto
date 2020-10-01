'use strict';

module.exports = {
  mailer: {
    auth: {
      user: process.env.MAIL_USER || null,
      pass: process.env.MAIL_PASS || null
    },
    host: process.env.MAIL_HOST || null,
    port: process.env.MAIL_PORT || null
  },
  ftp: {
    host: process.env.FTP_HOST || null,
    user: process.env.FTP_USER || null,
    password: process.env.FTP_PASSWORD || null,
    connTimeout: process.env.FTP_TIMEOUT || 20000,
    dir: '/datas/'
  },
  redis: {
    REDIS_URL: process.env.HEROKU_REDIS_IVORY_URL || 'redis://127.0.0.1:6379'
  }
}
