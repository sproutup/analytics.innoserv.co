'use strict';

/**
 * Module dependencies.
 */
var path = require('path');
var config = require('config/config');
var dynamoose = require('dynamoose');
var Promise = require('bluebird');
var _ = require('lodash');
var Network = dynamoose.model('Network');
var UserReach = dynamoose.model('UserReach');
var oauth = require('modules/oauth/server/oauth.service');
var instagram = require('modules/instagram/server/instagram.service');
var facebook = require('modules/facebook/server/facebook.service');
var twitter = require('modules/core/server/twitter.service');


/**
 * List all network
 */
exports.listAll = function (req, res) {
  console.log('[Network] list all');
  Network.scan().exec().then(function(items) {
    res.json(_.map(items, function(item){return item.toJsonSafe();}));
  })
  .catch(function(err){
    res.json(err);
  });
};

/**
 * List users network
 */
exports.list = function (req, res) {
  console.log('[network] list');
  Network.query({userId: req.userId}).exec()
    .then(function(data){
      res.json(_.map(data, function(item){return item.toJsonSafe();}));
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
      console.log('[network] get access token: ', req.network.token);
      return oauth.getAccessToken(
          req.network.token,
          req.network.provider,
          req.network.tokenSecret,
          req.body.verifier);
    })
    .then(function(access){
      console.log('[network] save access token: ', access);
      return Network.update(
        {userId: req.network.userId, provider: req.network.provider},
        {$PUT: { accessToken: access.accessToken,
                 refreshToken: access.refreshToken,
                 accessSecret: access.accessSecret,
                 identifier: access.identifier,
                 handle: access.handle,
                 status: 1}});
    })
    .then(function(network){
      console.log('network:::', network);
      return network.getUser();
    })
    .then(function(data){
      console.log('user: ', data);
      return Network.update({userId: req.network.userId, provider: req.network.provider},
        {$PUT: {identifier: data.identifier,
                 name: data.name,
                 url: data.url}});
    })
    .then(function(data){
       return data.getReach();
    })
    .then(function(data) {
      var userreach = new UserReach({userId: req.network.userId, provider: req.network.provider, value: data});
      console.log(userreach);
      return userreach.save();
    })
    .then(function(data){
      console.log('[network] done');
      res.json(req.network.toJsonSafe());
    })
    .catch(function(err){
      console.log(err);
      Network.update(
        {userId: req.network.userId, provider: req.network.provider},
          {$PUT: {status: -1, message: err.message}}).then(function(result){
            res.json('[network] update error');
          });
      return res.status(400).send({
        message: err
      });
    });
};

/**
 * Update user info
 */
exports.readAccount = function (req, res) {
  Network.get({userId: req.userId, provider: req.provider})
    .then(function(data){
      return data.getUser();
    })
    .then(function(data){
      console.log(data);
      res.json(data);
    })
    .catch(function(err){
      res.json(err);
    });
};

/**
 * Update user info
 */
exports.updateAccount = function (req, res) {
  Network.get({userId: req.userId, provider: req.provider})
    .then(function(data){
      return data.getUser();
    })
    .then(function(data){
      return Network.update({userId: req.userId, provider: req.provider},
        {$PUT: {identifier: data.identifier,
                 name: data.name,
                 url: data.url}});
    })
    .then(function(data){
      console.log(data);
      res.json(data);
    })
    .catch(function(err){
      res.json(err);
    });
};

/*
 * Show the users network
 */
exports.read = function (req, res) {
  Network.query('userId').eq(req.params.userId)
    .where('provider').eq(req.params.provider)
    .exec()
    .then(function(result){
      console.log('get network: ', result.length);
      if(result.length === 0){
        req.network = {};
      }
      else{
        req.network = result[0];
      }
      res.json(req.network.toJsonSafe());
      //res.json(_.pick(req.network, ['userId', 'provider', 'status', 'identifier', 'name', 'url']));
    })
    .catch(function(error){
      res.json(error);
    });
};

/*
 * Refresh access token
 */
exports.update = function (req, res) {
  console.log('[Network] update', req.params);
  Network.refreshAccessToken(req.params.userId, req.params.provider)
    .then(function(result){
      console.log('update success', result);
      return res.json('[network] update success');
    })
    .catch(function(error){
      console.log('update failed', error);
      res.status(400).send({
        message: error
      });
    });
};


/**
 * Delete
 */
exports.delete = function (req, res) {
  var item = req.network;

  Network.delete({userId: req.userId, provider: req.provider})
    .then(function(data){
      return UserReach.delete({userId: req.userId, provider: req.provider});
    })
    .then(function(data){
      res.json('success');
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
      var network = new Network();
      network.provider = req.provider;
      network.userId = req.userId;
      network.token = item.token;
      network.tokenSecret = item.tokenSecret;
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

/*
 * Show stats
 */
exports.readStats = function (req, res) {
  Network.get({userId: req.params.userId, provider: req.provider}).then(function(data){
    data.getReach(req.params.provider).then(function(data){
      res.json(data);
    });
  });

/* Network.query('userId').eq(req.params.userId)
    .where('provider').eq(req.params.provider).exec()
    .then(function(result){
      console.log('get network: ', result.length);
      if(result.length === 0){
        req.network = {};
      }
      else{
        var network = result[0];
        switch(req.provider){
          case 'tw':
            twitter.verifyCredentials(network.accessToken, network.accessSecret).then(function(response){
              console.log('show user: ', response);
              return res.json(response);
            });
            break;
          case 'fb':
            facebook.showUser('me', network.accessToken).then(function(response){
              console.log('show user: ', response);
              return res.json(response);
            });
            break;
          case 'ig':
            instagram.showUser('self', network.accessToken).then(function(response){
              console.log('show user: ', response);
              return res.json(response);
            });
            break;
          default:
            res.json('todo');
        }
      }
    });
    */
};


/**
 * Middleware
 */
exports.networkByUserID = function (req, res, next, id) {
  console.log('[param] validate userId: ', id);
  if (_.isUndefined(id)) {
    next(new Error('Invalid user id'));
  }
  req.userId = id;
  next();
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
  req.token = token;
  Network.query('token').eq(token).exec().then(function(result){
    console.log('get network: ', result);
    if(result.length === 0){
      return res.status(400).send({
        message: 'Token not found'
      });
    }
    req.network = result[0];
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
  console.log('[param] validate provider: ', provider);
  if (_.isUndefined(provider)) {
    return res.status(400).send({
      message: 'Provider is invalid'
    });
  }
  req.provider = provider;
  next();
};
