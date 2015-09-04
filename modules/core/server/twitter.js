'use strict';

var T = require('config/lib/twitter');


exports.process = function(url){
  console.log('twitter handler: ' + url);

  T.post('statuses/update', { status: 'hello world!' }, function(err, data, response) {
      console.log(data);
  });
};
