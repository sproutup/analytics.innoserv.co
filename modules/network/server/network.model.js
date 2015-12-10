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
var NetworkSchema  = new Schema({
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
  token: {
    type: String,
    required: true,
    index: {
      global: true,
      project: true
    }
  },
  'tokenSecret': String,
  'verifier': String,
  'accessToken': String,
  'accessSecret': String,
  'refreshToken': String,
  'identifier': String,
  'name': String,
  'url': String,
  'handle': String,
  'status': {
    type: Number,
    default: 0
  },
  'message': String
},
{
  throughput: {read: 15, write: 5}
});


NetworkSchema.statics.refreshAccessToken = Promise.method(function(userId, provider){
  var _this = this;
  return _this.queryOne('userId').eq(userId)
    .where('provider').eq(provider)
    .exec()
    .then(function(result){
      if(_.isUndefined(result)){
        throw new Error('[Network] not found');
      }
      else{
        console.log('[network] refresh network: ', result.provider);
        oauth.refreshAccessToken(result.refreshToken, result.provider)
          .then(function(access){
            console.log('[network] refresh access token: ', access.accessToken);
            return _this.update(
              {userId: result.userId, provider: result.provider},
              {$PUT: {
                 accessToken: access.accessToken,
                 accessSecret: access.accessSecret,
                 identifier: access.identifier,
                 handle: access.handle,
                 status: 1}});
          })
          .catch(function(err){
            _.update(
              {userId: result.userId, provider: result.provider},
              {$PUT: {status: -1}}).then(function(result){
                throw new Error('[network] update error');
            });
          });
      }
    })
    .catch(function(err){
      console.log('[Network] ', err);
      throw new Error('[Network] not found', err);
    });
});

NetworkSchema.methods.toJsonSafe = function(){
  return _.pick(this, ['userId', 'provider', 'status', 'identifier', 'name', 'url']);
};

NetworkSchema.methods.getUser = Promise.method(function(){
  console.log('network - get user');

  if(this.status !== 1 && false){
    console.log('cant get user when network is not connected');
    return -1;
  }
  else{
    switch(this.provider){
      case 'tw':
        return twitter.verifyCredentials(this.accessToken, this.accessSecret)
          .then(function(data){
            console.log('show user: ', data);
            return {identifier: data.id,
              name: data.name,
              url: 'https://twitter.com/' + data.screen_name};
        });
      case 'fb':
        return facebook.showUser('me', this.accessToken).then(function(data){
          console.log('show user: ', data);
          return {identifier: data.id,
            name: data.name,
            url: data.link};
        });
      case 'ga':
        return googleAnalytics.showUser(this.identifier, this.accessToken)
          .then(function(data){
            console.log('show user: ', data);
            return {identifier: data.webProperties[0].profiles[0].id,
                 name: data.name,
                 url: data.webProperties[0].websiteUrl};
          });
      case 'yt':
        return youtube.showUser('self', this.accessToken).then(function(data){
          console.log('show user: ', data);
            return {identifier: data.id,
              handle: data.id,
              name: data.snippet.title,
              url: 'https://www.youtube.com/channel/' + data.id};
        });
      case 'ig':
        return instagram.showUser('self', this.accessToken).then(function(data){
          console.log('show user: ', data);
          return {identifier: data.id,
            handle: data.username,
            name: data.full_name,
            url: 'https://www.instagram.com/' + data.username};
        });
      case 'pi':
        return pinterest.showUser('me', this.accessToken)
          .then(function(data){
          console.log('show user: ', data);
            return {identifier: data.id,
              handle: data.username,
              name: data.first_name + ' ' + data.last_name,
              url: data.url};
        });
      default:
        return 0;
    }
  }
});


NetworkSchema.methods.getReach = Promise.method(function(){
  console.log('network - get reach');

  if(this.status !== 1 && false){
    console.log('cant get reach when network is not connected');
    return 0;
  }
  else{
    switch(this.provider){
      case 'tw':
        return twitter.verifyCredentials(this.accessToken, this.accessSecret)
          .then(function(data){
            console.log('show user: ', data);
            return data.followers_count;
        });
      case 'fb':
        return facebook.showUser('me', this.accessToken).then(function(data){
          console.log('show user: ', data);
          return data.friends.summary.total_count;
        });
      case 'ga':
        return googleAnalytics.getReach(this.identifier, this.accessToken)
          .then(function(data){
            console.log('show reach: ', data);
            return data[0]/3;
          });
      case 'yt':
        return youtube.showUser('self', this.accessToken).then(function(data){
          console.log('show user: ', data);
          return data.statistics.subscriberCount;
        });
      case 'ig':
        return instagram.showUser('self', this.accessToken).then(function(data){
          console.log('show user: ', data);
          return data.counts.followed_by;
        });
      case 'pi':
        return pinterest.showUser('me', this.accessToken).then(function(data){
          console.log('show user: ', data);
          return data.counts.followers;
        });
      default:
        return 0;
    }
  }
});

var Network = dynamoose.model('Network', NetworkSchema);


