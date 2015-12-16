'use strict';

var defaultEnvConfig = require('./default');

module.exports = {
  db: {
    local: true,
    region: 'us-west-2',
    create: true,
    prefix: 'Test_'
  },
  port: process.env.PORT || 3001,
  redis: {
    port: 6379,          // Redis port
    host: '127.0.0.1',   // Redis host
    db: 1
  },
  knex: {
    client: 'mysql',
    connection: {
      host: process.env.MYSQL_HOST || '127.0.0.1',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || 'root',
      database: process.env.MYSQL_DATABASE || 'sproutup_db'
    },
    pool: {
      min: 2,
      max: 10
    }
  },
  app: {
    title: defaultEnvConfig.app.title + ' - Test Environment'
  },
  mailer: {
    from: process.env.MAILER_FROM || 'MAILER_FROM',
    options: {
      service: process.env.MAILER_SERVICE_PROVIDER || 'MAILER_SERVICE_PROVIDER',
      auth: {
        user: process.env.MAILER_EMAIL_ID || 'MAILER_EMAIL_ID',
        pass: process.env.MAILER_PASSWORD || 'MAILER_PASSWORD'
      }
    }
  },
  seedDB: process.env.MONGO_SEED || false
};
