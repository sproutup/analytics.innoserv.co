'use strict';

var moment = require('moment'),
    redis = require('config/lib/redis'),
    /* global -Promise */
    Promise = require('bluebird'),
    CronJob = require('cron').CronJob;
var request = require('request-promise');

// GET /users/user-id                 Get basic information about a user. To get information about the owner of the access token, you can use self instead of the user-id.
// GET /users/self/feed               See the authenticated user's feed.
// GET /users/user-id/media/recent    Get the most recent media published by a user. To get the most recent media published by the owner of the access token, you can use self instead of the user-id.
// GET /users/self/media/liked        See the authenticated user's list of liked media.
// GET /users/search                  Search for a user by name.

var GoogleAnalyticsService = function(){
  this.schema = {
    user: {
      id: null,
      followers_count: null,
      friends_count: null,
      statuses_count: null
    }
  };
};

/*
 * Init the api quotas and setup intervals
 */
GoogleAnalyticsService.init = function(){
  console.log('google analytics service init');

//  setInterval(LinkedAccount.process, moment.duration(1, 's').asMilliseconds());

//  Promise.join( 
//      TwitterService.quotaStatusesShowReset(), 
//      TwitterService.quotaStatusesRetweetsReset(),
//      function(statuses, retweets){
//        setInterval(TwitterService.quotaStatusesShowReset, moment.duration(1, 'm').asMilliseconds());
//        setInterval(TwitterService.quotaStatusesRetweetsReset, moment.duration(1, 'm').asMilliseconds());
//     }
//  );
};

GoogleAnalyticsService.getReach = function(id, token){
  var options = {
    uri: 'https://www.googleapis.com/analytics/v3/data/ga',
    qs: {
      access_token: token,
      ids: 'ga:'+id,
      'start-date': '91daysAgo',
      'end-date': 'yesterday',
      metrics: 'ga:sessions'
//      dimensions: 'ga:month'
    },
    json: true
  };
  console.log('options:', options);
  return request(options).then(function(data){
    console.log(data);
    return data.rows[0];
  })
  .catch(function(err){
    console.log('Error: ', err);
    throw {code: err.error.error.code, message: err.error.error.message};
  });

};

GoogleAnalyticsService.showUser = function(id, token){
  console.log('showUser:', id);
  var options = {
    uri: 'https://www.googleapis.com/analytics/v3/management/accountSummaries',
    qs: {
      access_token: token,
      part: 'id,snippet,statistics',
      mine: true
    },
    json: true
  };
  console.log('options:', options);
  return request(options).then(function(response){
/*    var user = {
      id: response.data.id,
      followers: response.data.counts.followed_by,
      friends: response.data.counts.follows,
      statuses: response.data.counts.media
    };*/
    console.log('ga res: ', response);
//      redis.hmset('twitter:user:'+id, user);
    return response.items[0];
  })
  .catch(function(err){
    console.log('Error: ', err);

    throw {code: err.error.error.code, message: err.error.error.message};
  });
};

module.exports = GoogleAnalyticsService;
