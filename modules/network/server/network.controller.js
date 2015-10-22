'use strict';

/**
 * Module dependencies.
 */
var path = require('path');
var config = require('config/config');
var dynamoose = require('config/lib/dynamoose');
var Promise = require('bluebird');
var _ = require('lodash');
var Network = dynamoose.model('Network');
var OAuth = require('oauth');

Promise.promisifyAll(OAuth);

/**
 * List of Articles
 */
exports.list = function (req, res) {
  console.log('user reach controller');

  Network.scan().exec().then(function(items) {
    console.log('user network result', items);
    res.json(items);
  })
  .catch(function(err){
    res.json(err);
  });
};

/**
 * Create a network
 */
exports.create = function (req, res) {
  var network = new Network(req.body);
  network.provider = req.provider;
  network.save()
    .then(function(){
      res.json(network);
    })
    .catch(function(err){
       return res.status(400).send({
        message: err
      });
    });
};

/*
 * Show the users network
 */
exports.read = function (req, res) {
  console.log('read');
  res.json(req.network);
};


/*
 * Get connection url
 */
exports.connect = function (req, res) {
  console.log('connect', config.twitter.clientID);
  console.log('connect', config.twitter);
  var oa = new OAuth.OAuth(
      'https://api.twitter.com/oauth/request_token',
      null,
      config.twitter.clientID, // 'consumerkey',
      config.twitter.clientSecret, //'consumersecret',
      '1.0',
      'http://localhost:9000/oauth/callback',
      'HMAC-SHA1');
  oa.setClientOptionsAsync({});

  oa.getOAuthRequestTokenAsync()
    .then(function(token){
      console.log('token: ', token);
      var url = oa.signUrl('https://api.twitter.com/oauth/authorize', token[0], token[1]);
      res.json(url);
    })
    .catch(function(err){
      console.log(err);
      res.json(err);
    });
};


/**
 * Middleware
 */
exports.networkByID = function (req, res, next, id) {
  console.log('middleware');
  if (_.isUndefined(id)) {
    return res.status(400).send({
      message: 'User ID is invalid'
    });
  }
  Network.query('userId').eq(id).exec().then(function(result){
    console.log('get network: ', result.length);
    if(result.length === 0){
      req.network = {'err': 'no network forund'};
    }
    else{
      req.network = result;
    }
    next();
  })
  .catch(function(err){
    return next(err);
  });
};

/**
 * Middleware
 */
exports.networkByProvider = function (req, res, next, provider) {
  console.log('middleware');
  if (_.isUndefined(provider)) {
    return res.status(400).send({
      message: 'Provider is invalid'
    });
  }
  req.provider = provider;
  switch(provider){
    case 'ga':
      req.oauth1 = false;
      req.oauth2 = true;
      break;
    case 'yt':
      req.oauth1 = false;
      req.oauth2 = true;
      break;
    case 'tw':
      req.oauth1 = true;
      req.oauth2 = false;
      break;
    default:
      return res.status(400).send({
        message: 'Provider is invalid'
      });
  }
  next();
};
