'use strict';

var defaultEnvConfig = require('./default');

module.exports = {
  db: {
    local: false,
    region: 'us-west-2',
    create: true,
    prefix: 'Dev_',
    uri: process.env.MONGOHQ_URL || process.env.MONGOLAB_URI || 'mongodb://' + (process.env.DB_1_PORT_27017_TCP_ADDR || 'localhost') + '/mean-dev',
    options: {
      user: '',
      pass: ''
    },
    // Enable mongoose debug mode
    debug: process.env.MONGODB_DEBUG || false
  },
  log: {
    // Can specify one of 'combined', 'common', 'dev', 'short', 'tiny'
    format: 'dev',
    // Stream defaults to process.stdout
    // Uncomment to enable logging to a log on the file system
    options: {
      //stream: 'access.log'
    }
  },
  app: {
    title: defaultEnvConfig.app.title + ' - Development Environment'
  },
  redis: {
    port: process.env.REDIS_PORT || 6379, // Redis port
    host: process.env.REDIS_HOST || '127.0.0.1', // Redis host
    db: process.env.REDIS_DB || 0  // Redis databases
  },
  dynamodb: {
    local: false
  },
  aws: {
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
  livereload: false,
  seedDB: process.env.MONGO_SEED || false
};
