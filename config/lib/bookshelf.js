'use strict';

/**
 * Module dependencies.
 */
var config = require('../config'),
    flyway = require('./flyway'),
  chalk = require('chalk'),
  path = require('path');

var knex = require('knex')(config.knex);

var bookshelf = require('bookshelf')(knex);

bookshelf.plugin('visibility');
bookshelf.plugin('registry');

// Load the models
module.exports.loadModels = function () {
  // Globbing model files
  config.files.server.models.forEach(function (modelPath) {
    console.log('list: ', modelPath);
      require(path.resolve(modelPath))(bookshelf);
  });
};

// Initialize Knex
module.exports.connect = function (cb) {
  var _this = this;
  console.log('init knex');
  flyway.migrate(function(err, data){
    if(err) cb(err);
    cb(err);
  });
};

module.exports.disconnect = function (cb) {
//  mongoose.disconnect(function (err) {
//    console.info(chalk.yellow('Disconnected from MongoDB.'));
//    cb(err);
//  });
  cb(null);
};
