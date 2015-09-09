'use strict';

var config = require('config/config'),
  redis = require('config/lib/redis'),
  content = require('modules/content/server/content.controller'),
  twitter = require('./twitter');

// Return url type
function getUrlType(item, callback) {
  var regTweet = /^https:\/\/twitter\.com\/(\w+)\/status\/(.+)$/;
  var regFacebookPost = /^https:\/\/www\.facebook\.com\/([^\/]+)\/posts\/(\d+)$/;
  var regYouTubeVideo = /^https:\/\/www\.youtube\.com\/watch\?v=([-\w]+)$/;
  var regUrl = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;

  //var self = this;
  var type = 'unknown';

  if(regTweet.test(item.url)){
    type = 'tweet';
    item.id = regTweet.exec(item.url)[2];
    twitter.process(item, callback);
  }
  else if(regFacebookPost.test(item.url)){
    type = 'facebook';
  }
  else if(regYouTubeVideo.test(item.url)){
    type = 'youtube';
  }
  else if(regUrl.test(item.url)){
    type = 'url';
  }

  callback(null, type);
}

/**
 * Process 
 */
exports.process = function () {
  console.log('processing');
  redis.lpop('queue:content').then(function(id){
    redis.rpush('queue:content', id);
    redis.hgetall('content:'+id).then(function(result){
      console.log('result:',new Date(parseInt(result.timestamp,10)));
      var date = new Date(parseInt(result.timestamp,10));
      console.log('date now', Date.now() - (date.getTime()+(60*1000)));
      if(Date.now() >  (date.getTime() + (60 * 1000)) ){
        console.log('its time');
        getUrlType(result, function(err, data){
          redis.hmset('content:'+id, 'timestamp',  Date.now());
        });
      }
      else{
        console.log('its not time');
      }
   });
  })
  .catch(function (err) {
  });
};

/**
 * Render the main application page
 */
exports.renderIndex = function (req, res) {
  res.render('modules/core/server/views/index', {
    user: req.user || null
  });
};

/**
 * Render the server error page
 */
exports.renderServerError = function (req, res) {
  res.status(500).render('modules/core/server/views/500', {
    error: 'Oops! Something went wrong...'
  });
};

/**
 * Render the server not found responses
 * Performs content-negotiation on the Accept HTTP header
 */
exports.renderNotFound = function (req, res) {

  res.status(404).format({
    'text/html': function () {
      res.render('modules/core/server/views/404', {
        url: req.originalUrl
      });
    },
    'application/json': function () {
      res.json({
        error: 'Path not found'
      });
    },
    'default': function () {
      res.send('Path not found');
    }
  });
};
