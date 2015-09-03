'use strict';

/**
 * Module dependencies.
 */
var config = require('../config'),
  chalk = require('chalk'),
  Redis = require('ioredis');

// Load the models
module.exports.loadModels = function () {
  // Globbing model files
  console.log('models: ');
  config.files.server.models.forEach(function (modelPath) {
    console.log(modelPath);
    require(path.resolve(modelPath));//(bookshelf);
  });
};

// Initialize Redis
module.exports.connect = function (cb) {
  var _this = this;
  console.log('init redis');

  new Redis({
    port: 6379,          // Redis port
      host: '127.0.0.1',   // Redis host
      family: 4,           // 4 (IPv4) or 6 (IPv6)
      password: 'auth',
      db: 0
  })

  cb(null);
};

module.exports.disconnect = function (cb) {
//  mongoose.disconnect(function (err) {
//    console.info(chalk.yellow('Disconnected from MongoDB.'));
//    cb(err);
//  });
  cb(null);
};


