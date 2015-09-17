'use strict';

var T = require('config/lib/twitter'),
    moment = require('moment'),
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
    counter : status[0].user.followers_count,
    date_dim_id : 260,
    user_id : 1,
    provider_dim_id : 3, // twitter:
    metrics_dim_id : 4 // followers 
  };

  return data;
};

TwitterService.process = function(item, callback){
  console.log('twitter handler: ', item);

  return T.getAsync('statuses/show', { id: item.status_id })
    .then(TwitterService.extractEvent)
    .then(function(data){
      data.content_id = item.id;
      return data;
    })
    .then(EventFact.insert)
    .then(function(next){
      return next;
    })
    .catch(function(err){
      console.log('twitter err: ' + err);
      return err;
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
