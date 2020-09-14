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
    url: process.env.REDIS_URL || 'redis://127.0.0.1:6379'
  }
}
