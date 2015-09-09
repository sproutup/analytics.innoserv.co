'use strict';

var T = require('config/lib/twitter');

// statuses/show/631208737580019712
// statuses/retweets/631208737580019712


exports.process = function(item, callback){
  console.log('twitter handler: ' + item.id);

  var date = new Date(item.timestamp);
  if(Date.now() >  date + 3600 * 1000){
      console.log('its time');
  }
  else{
      console.log('its not time');
  }

  T.get('statuses/show', { id: item.id }, function(err, data, response) {
      if(err) {
          console.log('twitter err: ' + err);
          return callback(err);
      }
      
      console.log('twitter success: ', data.user.followers_count);
      callback(null, data);
  });
};
