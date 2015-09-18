'use strict';

var T = require('config/lib/twitter'),
    moment = require('moment'),
    redis = require('config/lib/redis'),
    /* global -Promise */
    Promise = require('bluebird'),
    EventFact = require('modules/eventFact/server/eventFact.model');

// statuses/show/631208737580019712
// statuses/retweets/631208737580019712

var TwitterService = function(){
};

/*
 * Init the twitter api quotas and setup intervals
 */
TwitterService.init = function(){
  console.log('twitter service init');
  Promise.join( 
      TwitterService.quotaStatusesShowReset(), 
      TwitterService.quotaStatusesRetweetsReset(),
      function(statuses, retweets){
        setInterval(TwitterService.quotaStatusesShowReset, moment.duration(15, 'm').asMilliseconds());
        setInterval(TwitterService.quotaStatusesRetweetsReset, moment.duration(15, 'm').asMilliseconds());
     }
  );
};

/*
 * extraxt an event from a status received from twitter api
 */
TwitterService.extractEvent = function(status){
  var data = {
    counter : status.user.followers_count,
    date_dim_id : 260,
    user_id : 1,
    provider_dim_id : 3, // twitter:
    metrics_dim_id : 4 // followers 
  };

  return data;
};

TwitterService.extractEventFromRT = function(status){
  var data = {
    counter : status[0].user.followers_count,
    date_dim_id : 260,
    user_id : 1,
    provider_dim_id : 3, // twitter:
    metrics_dim_id : 4 // followers 
  };

  return data;
};

TwitterService.quotaStatusesShowDecr = function(){
  return redis.decr('quota:twitter:statuses:show');
};

TwitterService.quotaStatusesShowReset = function(){
  return redis.set('quota:twitter:statuses:show', 180);
};

TwitterService.quotaStatusesRetweetsDecr = function(){
  return redis.decr('quota:twitter:statuses:retweets');
};

TwitterService.quotaStatusesRetweetsReset = function(){
  return redis.set('quota:twitter:statuses:retweets', 60);
};

TwitterService.setFlag = function(id){
  return redis.sadd('analytics:tweet:flag', id);
};

TwitterService.getFlag = function(id){
  return redis.sismember('analytics:tweet:flag', id);
};

TwitterService.processStatus = function(item) {
  return TwitterService.getFlag(item.status_id)
    .then(function(val){
      if(val===1){
          return val;
      }
      else{
        return TwitterService.quotaStatusesShowDecr()
          .then(function(val){
            console.log('statuses quota: ', val);
            // ups we are out of quota
            if(val<1){
              console.log('-- suspend statuses show, quota used: ', val);
              return val;
            }
            else{
              return T.getAsync('statuses/show', { id: item.status_id })
               .then(function(data){
                 console.log('status_id:',item.status_id);
                 return data[0];
               })
               .then(TwitterService.extractEvent)
               .then(function(data){
                 data.content_id = item.id;
                 data.product_id = item.product_id;
                 data.user_id = item.user_id;
                 return data;
               })
               .then(EventFact.insert)
               .then(function(next){
                 return TwitterService.setFlag(item.status_id);
               });         
            }
         });
      }
    });
};

TwitterService.processRetweets = function(item){
  var _self = this;

  return TwitterService.quotaStatusesRetweetsDecr()
    .then(function(val){
      console.log('statuses retweets quota: ', val);
      // ups we are out of retweet quota
      if(val<1){
        console.log('-- suspend retweet, quota used: ', val);
        return val;
      }
      else{
        return T.getAsync('statuses/retweets', { id: item.status_id })
        .then(function(data){
          return data[0];
        })
        .map(function(status){
          return TwitterService.getFlag(status.id)
            .then(function(val){
              if(val===1){
                  return val;
              }
              else{
                var data = TwitterService.extractEvent(status);
                data.content_id = item.id; 
                return EventFact.insert(data)
                  .then(function(next){
                    return TwitterService.setFlag(status.id);
                  });
              }         
            });
        })
        .then(function(next){
          console.log('len: ', next.length);
          return next;
        })
        .catch(function(err){
          console.log('twitter err: ' + err);
          return err;
        });     
      }
    });
};

TwitterService.process = function(item, callback){
  var _self = this;
  console.log('twitter handler: ', item.id);
  _self.processStatus(item)
    .then(function(res){
        _self.processRetweets(item);
    });
/*
  T.get('statuses/show', { id: item.id }, function(err, data, response) {
      if(err) {
          console.log('twitter err: ' + err);
          return callback(err);
      }
     
      var item = new EventFact();
      item.data.counter = data.user.followers_count;
      item.data.date_dim_id = 260;
      item.data.user_id = 1;
      item.data.provider_dim_id = 3; // twitter:
      item.data.metrics_dim_id = 4; // followers
      item.insert();

      // todo add to redis
      // add viems to sorted set

      console.log('twitter success: ', data.user.followers_count);
      callback(null, data);
  });
  */
};

module.exports = TwitterService;
