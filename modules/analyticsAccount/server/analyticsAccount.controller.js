'use strict';

/**
 * Module dependencies.
 */
var path = require('path');
var errorHandler = require(path.resolve('./modules/core/server/errors.controller'));
var AnalyticsAccount = require('modules/analyticsAccount/server/analyticsAccount.model');
var Queue = require('modules/core/server/circularQueue');
var redis = require('config/lib/redis');
var youtube = require('modules/core/server/youtubeanalytics.service');
var _ = require('lodash');

var AnalyticsAccountController = function(){
};

AnalyticsAccount.key = 'queue:analytics_account';

/**
 * Add all content to the queue
 */
AnalyticsAccountController.init = function (req, res) {
  var q = new Queue('queue:analytics:account');
  console.log('init');
  return q.clear()
    .then(function(){
      return q.last();
    })
    .then(AnalyticsAccount.findGreaterThan)
    .then(function(val){
      if(val.length>0){
        return q.add(val);
      }
    })
    .then(function(result){
      console.log(result);
      res.json({res: result});
    });
};

AnalyticsAccountController.listQueue = function(req, res){
  console.log('list queue');
  var q = new Queue('queue:analytics:account');
  return q.list()
    .then(function(result){
      res.json({res: result});
    })
    .catch(console.log.bind(console));
};

AnalyticsAccountController.next = function(req, res){
  var _self = this;
  //var q = new Queue(AnalyticsAccountController.key);

  var q = new Queue('queue:analytics:account');
  return q.next()
    .then(function(item){
      if(_.isUndefined(item)){
        console.log('undefined');
        return 'empty list';
      }
      console.log('queue:analytics:account -> ', item);
      return AnalyticsAccount.get(item)
      .then(function(account){
        console.log('account:', account.data.scope);
        if(account.data.scope.indexOf('youtube.readonly')>0){
          console.log(account.data.scope.indexOf('youtube.readonly'));
          account.getToken()
            .then(function(result){
              console.log('getting channels');
              youtube.getChannels()
                .map(function(channel){
                console.log(channel.items);
              });
              return result;
            });
        }
        return account;
      })
      .then(function(result){
        res.json(result);
      });
    });
//    .catch(console.log.bind(console));

};

AnalyticsAccountController.list = function(req, res) {
  AnalyticsAccount.getAll()
    .then(function(result) {
      res.json(result);
    });
};

AnalyticsAccountController.read = function(req, res) {
  res.json(req.account);
};

AnalyticsAccountController.accountById = function(req, res, next, id) {
  AnalyticsAccount.get(id)
    .then(function(result){
      console.log('heres the result from accountById: ', result);
      req.account = result;
      next();
    });
};

module.exports = AnalyticsAccountController;
