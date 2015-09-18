'use strict';

var T = require('config/lib/twitter'),
    moment = require('moment'),
  redis = require('config/lib/redis'),
 EventFact = require('modules/eventFact/server/eventFact.model');

// statuses/show/631208737580019712
// statuses/retweets/631208737580019712

var TwitterService = function(){
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
       return T.getAsync('statuses/show', { id: item.status_id })
        .then(function(data){
            console.log('status_id:',item.status_id);
            return data[0];
          })
        .then(TwitterService.extractEvent)
        .then(function(data){
          data.content_id = item.id;
          return data;
        })
        .then(EventFact.insert)
        .then(function(next){
          return TwitterService.setFlag(item.status_id);
        });         
      }
    });
};

TwitterService.processRetweets = function(item){
  var _self = this;
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
