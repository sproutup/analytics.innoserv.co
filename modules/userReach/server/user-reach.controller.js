'use strict';

/**
 * Module dependencies.
 */
var path = require('path');
var dynamoose = require('config/lib/dynamoose');
var _ = require('lodash');
var UserReach = dynamoose.model('UserReach');
var Network = dynamoose.model('Network');

/**
 * Create
 */
exports.create = function(req, res){
  var reach = new UserReach(req.body);
  //reach.provider = req.provider;
  reach.userId = req.userId;
  console.log(reach);
  reach.save().then(function(result){
    res.json(result);
  })
  .catch(function(err){
    return res.status(400).send({
      message: err.message
    });
  });
};

/**
 * List
 */
exports.list = function (req, res) {
  UserReach.query('userId').eq(req.userId).exec().then(function(userReach){
    var result = {};
    var total = 0;
    _.forEach(userReach, function(val){
      result[val.provider] = val.value;
      total += val.value;
    });
    result.total = total;
    res.json(result);
  })
  .catch(function(err){
    res.json(err);
  });
};

/*
 * Read
 */
exports.read = function (req, res) {
  UserReach.get({userId: req.userId, provider: req.provider})
    .then(function(userReach){
      var result = {};
      result[userReach.provider] = userReach.value;
      res.json(result);
  })
  .catch(function(err){
    return res.json(err);
  });
};

/**
 * Update
 */
exports.update = function (req, res) {
  Network.get({userId: req.userId, provider: req.provider})
    .then(function(data) {
      return data.getReach();
    })
    .then(function(data) {
      var userreach = new UserReach({userId: req.userId, provider: req.provider, value: data});
      console.log(userreach);
      return userreach.save();
    })
    .then(function(userReach) {
      var result = {};
      result[userReach.provider] = userReach.value;
      res.json(result);
    })
    .catch(function(err){
      console.log('err:', req.provider);
      Network.update({userId: req.userId, provider: req.provider}, {$PUT: {status: -1, message: err.message}})
        .then(function(data){
          console.log('err saved');
        })
      .catch(function(err){
        console.log(err);
      });
      return res.json(err);
    });
};

/**
 * Middleware
 */
exports.userReachByID = function (req, res, next, id) {
  if (_.isUndefined(id)) {
    return res.status(400).send({
      message: 'User ID is invalid'
    });
  }
  console.log('user id: ', id);
  req.userId = id;
  next();
};

exports.reachByProvider = function (req, res, next, provider) {
  if (_.isUndefined(provider)) {
    return res.status(400).send({
      message: 'Provider is invalid'
    });
  }

  req.provider = provider;

  Network.get({userId: req.params.userId, provider: provider})
    .then(function(data) {
//      if(_.isUndefined(data)){
//        return res.status(400).send({
//          message: 'No '+ provider +' connection found'
//        });
//      }
      req.network = data;
      next();
    });
};
