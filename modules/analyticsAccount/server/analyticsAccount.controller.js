'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  errorHandler = require(path.resolve('./modules/core/server/errors.controller')),
  AnalyticsAccountModel = require('modules/analyticsAccount/server/analyticsAccount.model');

  var AnalyticsAccount = new AnalyticsAccountModel();

  exports.list = function(req, res) {
    AnalyticsAccount.getAll()
      .then(function(result) {
        res.json(result);
      });
  };

  exports.read = function(req, res) {
    res.json(req.account);
  };

  exports.accountById = function(req, res, next, id) {
    AnalyticsAccount.get(id).then(function(result){
      console.log('heres the result from accountById: ', result);
      req.account = result;
      next();
    });
  };
