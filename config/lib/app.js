'use strict';

/**
 * Module dependencies.
 */
var config = require('../config'),
  bookshelf = require('./bookshelf'),
  redis = require('./redis'),
  dynamoose = require('./dynamoose'),
  googleapi = require('./googleapi'),
  express = require('./express'),
  chalk = require('chalk'),
  CronJob = require('cron').CronJob,
  TwitterService = require('modules/core/server/twitter.service'),
  LinkedAccountController = require('modules/linkedAccount/server/linkedAccount.controller'),
  ContentController = require('modules/content/server/content.controller'),
  core = require('modules/core/server/core.controller');

// Initialize Models
//mongoose.loadModels();
bookshelf.loadModels();

var Promise = require('bluebird');

process.on('uncaughtException', function (err) {
  console.error('An uncaught error occurred!');
  console.error(err.stack);
});

//SeedDB
if (config.seedDB) {
  require('./seed');
}

module.exports.loadModels = function loadModels() {
  bookshelf.loadModels();
//  mongoose.loadModels();
};

module.exports.init = function init(callback) {

  LinkedAccountController.update();

  bookshelf.connect(function (db){
    var app = express.init(db);
    new CronJob('0 */1 * * * *',
        function() {
          console.log('Check for new linked accounts');
          LinkedAccountController.update();
        },
        null,
        true);

    new CronJob('*/10 * * * * *',
        function() {
          LinkedAccountController.process();
        },
        null,
        true);

    TwitterService.quotaStatusesShowReset();
    TwitterService.quotaStatusesRetweetsReset();
//
//    new CronJob('0 */1 * * * *',
//        function() {
//          console.log('Check for new content');
//          TwitterService.quotaStatusesShowReset();
//        },
//        null,
//        true);
//
//    new CronJob('0 */1 * * * *',
//        function() {
//          console.log('Check for new content');
//          TwitterService.quotaStatusesRetweetsReset();
//        },
//        null,
//        true);
//
//    new CronJob('0 */1 * * * *',
//        function() {
//          console.log('Check for new content');
//          core.updateContentList();
//        },
//        null,
//        true);
//
//    new CronJob('*/2 * * * * *',
//        function() {
//          ContentController.process();
//        },
//        null,
//        true);

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
      if (process.env.NODE_ENV === 'secure') {
        console.log(chalk.green('HTTPs:\t\t\t\ton'));
      }
      console.log('--');

      if (callback) callback(app, db, config);
    });

  });

};
