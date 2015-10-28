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
var oauth = require('modules/oauth/server/oauth.service');

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
  if (_.isUndefined(req.body.verifier)) {
    return res.status(400).send({
      message: 'Verifier is missing'
    });
  }

  req.network.verifier = req.body.verifier;
  Network.update(
      {userId: req.network.userId, provider: req.network.provider},
      {$PUT: {verifier: req.body.verifier, status: 1}})
    .then(function(){
      res.json(req.network);
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


/**
 * Delete
 */
exports.delete = function (req, res) {
  var item = req.network;

  Network.delete({userId: req.userId, provider: req.provider}).then(function(data){
    res.json(data);
	})
	.catch(function(err){
    console.log('err:',err);
    return res.status(400).send({
      message: err
    });
	});
};


/*
 * Get connection url
 */
exports.connect = function (req, res) {
  console.log('[network] connect', req.config);
  var url = '';

  oauth.generateAuthURL(req.provider)
    .then(function(item){
      console.log('[network] auth url', item);
      url = item.url;
      console.log('save token: ', item.token);
      var network = new Network();
      network.provider = req.provider;
      network.userId = req.userId;
      network.token = item.token;
      network.tokenSecret = item.secret;
      network.status = 0;
      return network.save();
    })
    .then(function(item){
      res.json({error: '', url: url});
    })
    .catch(function(err){
      console.log('[network] err:', err);
      res.json({error: err});
    });
};


/**
 * Middleware
 */
exports.networkByUserID = function (req, res, next, id) {
  console.log('middleware');
  if (_.isUndefined(id)) {
    return res.status(400).send({
      message: 'User ID is invalid'
    });
  }
  Network.query('userId').eq(id).exec().then(function(result){
    console.log('get network: ', result.length);
    if(result.length === 0){
      req.network = [];
    }
    else{
      req.network = result;
    }
    req.userId = id;
    next();
  })
  .catch(function(err){
    return next(err);
  });
};

/**
 * Middleware
 */
exports.networkByToken= function (req, res, next, token) {
  console.log('middleware token');
  if (_.isUndefined(token)) {
    return res.status(400).send({
      message: 'Token is invalid'
    });
  }
  Network.query('token').eq(token).exec().then(function(result){
    console.log('get network: ', result.length);
    if(result.length === 0){
      return res.status(400).send({
        message: 'Token not found'
      });
    }
    req.network = result[0];
    req.token = token;
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
  next();
};
