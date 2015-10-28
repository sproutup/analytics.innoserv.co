'use strict';

var config = require('config/config');
var Promise = require('bluebird');
var _ = require('lodash');
var OAuth = require('oauth');
var querystring = require('querystring');
var crypto = require('crypto');

Promise.promisifyAll(OAuth);

var OAuthService = function(){
  var m = {};
  this.m.key = '';
  this.m.latest = m.key + ':last';
};

var OAuth1 = function(){
  var m = {};
};

var OAuth2 = function(){
  var m = {};
};


//OAuthService.len = function(){
//  return redis.llen(this.m.key);
//};

/**
 * Step 1 : Generate authorization URL
 */
OAuthService.generateAuthURL = function (provider) {
  console.log('[oauth] generate auth url');
  if (_.isUndefined(provider)) {
    return Promise.reject('Invalid provider');
  }
  var params = {
    config: {},
    scope: '',
    provider: provider
  };
  switch(provider){
    case 'ga':
      params.config = config.google;
      params.scope = config.google.scope.ga;
      return OAuth2.getAuthRequestURL(params);
    case 'yt':
      params.config = config.google;
      params.scope = config.google.scope.yt;
      return OAuth2.getAuthRequestURL(params);
    case 'fb':
      params.config = config.facebook;
      params.scope = config.facebook.scope;
      return OAuth2.getAuthRequestURL(params);
    case 'ig':
      params.config = config.instagram;
      params.scope = config.instagram.scope;
      return OAuth2.getAuthRequestURL(params);
    case 'pi':
      params.config = config.pinterest;
      params.scope = config.pinterest.scope;
      return OAuth2.getAuthRequestURL(params);
    case 'tw':
      params.config = config.twitter;
      return OAuth1.getAuthRequestURL(params);
    default:
      return Promise.reject('Invalid provider');
  }
};

/*
 * getRequestToken
 */
OAuth1.getAuthRequestURL = function(params){
  var res = {
    url: '',
    token: '',
    secret: ''
  };

  var oa = new OAuth.OAuth(
      params.config.requestURL, //  'https://api.twitter.com/oauth/request_token',
      null,
      params.config.clientID, // 'consumerkey',
      params.config.clientSecret, //'consumersecret',
      '1.0',
      params.config.callbackURL, // 'http://localhost:9000/oauth/callback',
      'HMAC-SHA1');

  oa.setClientOptionsAsync({});

  return oa.getOAuthRequestTokenAsync()
    .then(function(item){
      res.token = item[0];
      res.secret = item[1];
      console.log('[oath1] sign url: ', res);
      return oa.signUrl( params.config.authorizeURL, res.token, res.secret);
    })
    .then(function(url){
      res.url = url;
      return res;
    });
};

/*
 * Compile the request URL
 */
OAuth2.getAuthRequestURL = function(params){
  var res = {
    url: '',
    token: '',
    secret: ''
  };

  var str = {
    'redirect_uri': params.config.callbackURL,
    'response_type': 'code',
    'client_id': params.config.clientID,
    'scope': params.scope,
    'include_granted_scopes': 'true',
    'access_type': 'offline',
    'state': crypto.randomBytes(16).toString('hex')
  };

  res.url = params.config.requestURL + '?' + querystring.stringify(str);
  res.token = str.state;
  res.secret = 'na';

  return Promise.resolve(res);
};

module.exports = OAuthService;
