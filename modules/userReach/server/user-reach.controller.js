'use strict';

/**
 * Module dependencies.
 */
var path = require('path');
var dynamoose = require('config/lib/dynamoose');
var _ = require('lodash');
var UserReach = dynamoose.model('UserReach');

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
  console.log('user reach controller');

  UserReach.query('userId').eq(req.userId).exec().then(function(userReach){
    console.log('get reach: ', userReach.length);
    if(userReach.length === 0){
      req.userReach = {'total': 0};
    }
    else{
      req.userReach = userReach[0];
    }
    res.json(req.userReach);
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
    console.log('get reach: ', _.pick(userReach, ['provider', 'value']));
    res.json(_.pick(userReach, ['provider', 'value']));
  })
  .catch(function(err){
    return res.json(err);
  });
};

/**
 * Update
 */
exports.update = function (req, res) {
  UserReach.get({userId: req.userId, provider: req.provider})
    .then(function(userReach){
    console.log('get reach: ', _.pick(userReach, ['provider', 'value']));
    res.json(_.pick(userReach, ['provider', 'value']));
  })
  .catch(function(err){
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
  console.log('provider: ', provider);
  req.provider = provider;
  next();
};
