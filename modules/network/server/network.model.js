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
var oauthService = require('modules/oauth/server/oauth.service');
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
//  'accessToken': String,
//  'accessSecret': String,
//  'refreshToken': String,
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

NetworkSchema.statics.saveIdentity = Promise.method(function(userId, provider, access){
  var _this = this;
  console.log('[Network model] save identity');
  return _this.update(
    {userId: userId, provider: provider},
    {$PUT: { //accessToken: access.accessToken,
             //refreshToken: access.refreshToken,
             //accessSecret: access.accessSecret,
             identifier: access.identifier,
             handle: access.handle,
             status: 1}})
    .catch(function(err){
      console.log('[Network model] save identity: ', err);
      throw err;
    });

//  this.accessToken = access.accessToken;
//  this.accessSecret = access.accessSecret;
//  this.identifier = access.identifier;
//  this.handle = access.handle;
//  this.status = 1;
/*  return _this.update({userId: _this.userId, provider: _this.provider}, {$PUT: {accessToken: access.accessToken, status: 1}})
    .then(function(data){
      console.log('[save access token]: ', oauthService);
      return oauthService.saveAccessToken(_this.userId, _this.provider, access.accessToken, access.refreshToken);
      //return data;
    })
    .catch(function(err){
      console.log(err);
      throw err;
    }); */
});

NetworkSchema.statics.refreshAccessToken = Promise.method(function(userId, provider){
  var _this = this;
  var _result = null;

  return _this.queryOne('userId').eq(userId)
    .where('provider').eq(provider)
    .exec()
    .then(function(result){
      if(_.isUndefined(result)){
        throw new Error('[Network] not found');
      }
      else{
        _result = result;
        console.log('[network] refresh network: ', result.provider);
        return result;
      }
    })
    .then(function(network){
      return oauthService.refreshAccessToken(network.refreshToken, network.provider);
    })
    .then(function(access){
      console.log('[network] refresh access token: ', access.accessToken);
      return _this.update(
        {userId: _result.userId, provider: _result.provider},
        {$PUT: {
           accessToken: access.accessToken,
           accessSecret: access.accessSecret,
           identifier: access.identifier,
           handle: access.handle,
           status: 1}});
    })
    .catch(function(err){
      console.log('ups error: ', err);
      _this.update(
        {userId: _result.userId, provider: _result.provider},
        {$PUT: {status: -1}});
      throw err;
    });
});

NetworkSchema.methods.toJsonSafe = function(){
  return _.pick(this, ['userId', 'provider', 'status', 'identifier', 'name', 'url']);
};

NetworkSchema.statics.getUser = Promise.method(function(network, oauth){
  console.log('network - get user', network.provider);
  var accessToken = oauth.accessToken;
  var accessSecret = oauth.accessSecret;

    if(_.isUndefined(oauth)){
      return -1;
    }

    switch(network.provider){
      case 'tw':
        return twitter.verifyCredentials(accessToken, accessSecret)
          .then(function(data){
            return {identifier: data.id,
              name: data.name,
              url: 'https://twitter.com/' + data.screen_name};
        });
      case 'fb':
        return facebook.showUser('me', accessToken).then(function(data){
          return {identifier: data.id,
            name: data.name,
            url: data.link};
        });
      case 'ga':
        return googleAnalytics.showUser(network.identifier, accessToken)
          .then(function(data){
            return {identifier: data.webProperties[0].profiles[0].id,
                 name: data.name,
                 url: data.webProperties[0].websiteUrl};
          });
      case 'yt':
        return youtube.showUser('self', accessToken).then(function(data){
            return {identifier: data.id,
              handle: data.id,
              name: data.snippet.title,
              url: 'https://www.youtube.com/channel/' + data.id};
        });
      case 'ig':
        return instagram.showUser('self', accessToken).then(function(data){
          return {identifier: data.id,
            handle: data.username,
            name: data.full_name,
            url: 'https://www.instagram.com/' + data.username};
        });
      case 'pi':
        return pinterest.showUser('me', accessToken)
          .then(function(data){
            return {identifier: data.id,
              handle: data.username,
              name: data.first_name + ' ' + data.last_name,
              url: data.url};
        });
      default:
        return 0;
    }
});


NetworkSchema.statics.getReach = Promise.method(function(network, oauth){
  console.log('network - get reach', network, oauth);

  if(network.status !== 1 && false){
    console.log('cant get reach when network is not connected');
    return 0;
  }
  else{
    switch(network.provider){
      case 'tw':
        return twitter.verifyCredentials(oauth.accessToken, oauth.accessSecret)
          .then(function(data){
            console.log('show user: ', data);
            return data.followers_count;
        });
      case 'fb':
        return facebook.showUser('me', oauth.accessToken).then(function(data){
          console.log('show user: ', data);
          return data.friends.summary.total_count;
        });
      case 'ga':
        return googleAnalytics.getReach(network.identifier, oauth.accessToken)
          .then(function(data){
            console.log('show reach: ', data);
            return data[0]/3;
          });
      case 'yt':
        return youtube.showUser('self', oauth.accessToken).then(function(data){
          console.log('show user: ', data);
          return data.statistics.subscriberCount;
        });
      case 'ig':
        return instagram.showUser('self', network.accessToken).then(function(data){
          console.log('show user: ', data);
          return data.counts.followed_by;
        });
      case 'pi':
        return pinterest.showUser('me', network.accessToken).then(function(data){
          console.log('show user: ', data);
          return data.counts.followers;
        });
      default:
        return 0;
    }
  }
});

var Network = dynamoose.model('Network', NetworkSchema);


