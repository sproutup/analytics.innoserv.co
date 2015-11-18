'use strict';

/**
 *  * Module dependencies.
 *   */
var dynamoose = require('config/lib/dynamoose');
var Schema = dynamoose.Schema;
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
  'refreshToken:': String,
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
            return data.followers_count;
        });
      case 'fb':
        return facebook.showUser('me', this.accessToken).then(function(data){
          console.log('show user: ', data);
          return data;
        });
      case 'ga':
        return googleAnalytics.showUser(this.identifier, this.accessToken)
          .then(function(data){
            console.log('show user: ', data);
            return data;
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
          return data;
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

dynamoose.model('Network', NetworkSchema);
