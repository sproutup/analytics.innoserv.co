'use strict';

/**
 *  * Module dependencies.
 *   */
var dynamoose = require('dynamoose');
var Schema = dynamoose.Schema;
var Promise = require('bluebird');
var instagram = require('modules/instagram/server/instagram.service');
var youtube = require('modules/youtube/server/youtube.service');
var googleAnalytics = require('modules/googleAnalytics/server/googleAnalytics.service');
var pinterest = require('modules/pinterest/server/pinterest.service');
var facebook = require('modules/facebook/server/facebook.service');
var twitter = require('modules/core/server/twitter.service');
var oauth = require('modules/oauth/server/oauth.service');
var _ = require('lodash');

/**
 *  * User Reach Schema
 *   */
var OauthSchema  = new Schema({
  userId: {
    type: Number,
    validate: function(v) { return v > 0; },
    hashKey: true
  },
  provider: {
    type: String,
    rangeKey: true,
    index: true
  },
//  token: {
//    type: String,
//    required: true,
//    index: {
//      global: true,
//      project: true
//    }
//  },
  'tokenSecret': String,
  'verifier': String,
  'accessToken': String,
  'accessSecret': String,
  'refreshToken': String,
  'status': {
    type: Number,
    default: 0
  },
  'message': String
},
{
  throughput: {read: 15, write: 5}
});


var Oauth = dynamoose.model('Oauth', OauthSchema);
