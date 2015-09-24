'use strict';

/**
 * Module dependencies.
 */
var config = require('../config'),
  mongoose = require('./mongoose'),
  bookshelf = require('./bookshelf'),
  redis = require('./redis'),
  googleapi = require('./googleapi'),
  express = require('./express'),
  chalk = require('chalk'),
  cron = require('cron'),
  twitterService = require('modules/core/server/twitter.service'),
  core = require('modules/core/server/core.controller');

// Initialize Models
//mongoose.loadModels();
bookshelf.loadModels();

require('bluebird');

//SeedDB
if (config.seedDB) {
  require('./seed');
}

module.exports.loadModels = function loadModels() {
  bookshelf.loadModels();
//  mongoose.loadModels();
};

module.exports.init = function init(callback) {
  
  bookshelf.connect(function (db){
    var app = express.init(db);

    // process data in intervals
//    setInterval(core.process,  2 * 1000);
//    setInterval(core.updateContentList, 10 * /* 60 */ 1000);
//    setInterval(core.processLinkedAccounts, 10 * /* 60 */ 1000);

    twitterService.init();

    if(callback) callback(app, db, config);
  });
  
//  mongoose.connect(function (db) {
//      // Initialize express
//      var app = express.init(db);
//      if (callback) callback(app, db, config);      
//    });
// });
};

module.exports.start = function start(callback) {
  var _this = this;

  _this.init(function (app, db, config) {

    // Start the app by listening on <port>
    app.listen(config.port, function () {

      // Logging initialization
      console.log('--');
      console.log(chalk.green(config.app.title));
      console.log(chalk.green('Environment:\t\t\t' + process.env.NODE_ENV));
      console.log(chalk.green('Port:\t\t\t\t' + config.port));
      console.log(chalk.green('Database:\t\t\t' + config.db.uri));
      if (process.env.NODE_ENV === 'secure') {
        console.log(chalk.green('HTTPs:\t\t\t\ton'));
      }
      console.log('--');

      if (callback) callback(app, db, config);
    });

  });

};
