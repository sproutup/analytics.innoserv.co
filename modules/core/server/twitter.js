'use strict';

var T = require('config/lib/twitter');

// statuses/show/631208737580019712
// statuses/retweets/631208737580019712


exports.process = function(id, callback){
  console.log('twitter handler: ' + id);

  T.get('statuses/show', { id: id }, function(err, data, response) {
      if(err) {
          console.log('twitter err: ' + err);
          callback(err);
      }
      
      console.log('twitter success: ', data.user.followers_count);
      callback(null, data);
  });
};
