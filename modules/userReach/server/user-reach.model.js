'use strict';

/**
 *  * Module dependencies.
 *   */
var dynamoose = require('dynamoose');
var Schema = dynamoose.Schema;
var Network = dynamoose.model('Network');
var OAuth = dynamoose.model('oauth');
var Promise = require('bluebird');
var instagram = require('modules/instagram/server/instagram.service');
var youtube = require('modules/youtube/server/youtube.service');
var googleAnalytics = require('modules/googleAnalytics/server/googleAnalytics.service');
var pinterest = require('modules/pinterest/server/pinterest.service');
var facebook = require('modules/facebook/server/facebook.service');
var twitter = require('modules/core/server/twitter.service');

/**
 *  * User Reach Schema
 *   */
var UserReachSchema  = new Schema({
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
  value: Number
},
{
  throughput: {read: 15, write: 5}
});

UserReachSchema.statics.getReach = Promise.method(function(network, oauth){
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
            return Math.ceil(data[0]/3);
          });
      case 'yt':
        return youtube.showUser('self', oauth.accessToken).then(function(data){
          console.log('show user: ', data);
          return data.statistics.subscriberCount;
        });
      case 'ig':
        return instagram.showUser('self', oauth.accessToken).then(function(data){
          console.log('show user: ', data);
          return data.counts.followed_by;
        });
      case 'pi':
        return pinterest.showUser('me', oauth.accessToken).then(function(data){
          console.log('show user: ', data);
          return data.counts.followers;
        });
      default:
        return 0;
    }
  }
});


UserReachSchema.statics.refresh = function (userId, provider) {
  var _this = this;
  return Promise.join(
      Network.get({userId: userId, provider: provider}),
      OAuth.getAccessToken(userId, provider),
      function(data, account){
      return _this.getReach(data, account);
    })
   .then(function(data) {
      console.log(data);
      return _this.update({userId: userId, provider: provider}, {$PUT: {value: data}});
    })
    .then(function(userReach) {
      var result = {};
      console.log(userId, provider);
      result[userReach.provider] = userReach.value;
      return result;
    })
    .catch(function(err){
      console.log('err:', err);
      Network.update({userId: userId, provider: provider}, {$PUT: {status: -1, message: err.message}})
        .then(function(data){
          console.log('err saved');
        })
      .catch(function(err){
        console.log(err);
      });
      throw err;
    });
};

dynamoose.model('UserReach', UserReachSchema);
