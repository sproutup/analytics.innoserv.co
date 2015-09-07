'use strict';

var config = require('config/config'),
  redis = require('config/lib/redis'),
  content = require('modules/content/server/content.controller'),
  twitter = require('./twitter');

// Return url type
function getUrlType(_url, callback) {
  var regTweet = /^https:\/\/twitter\.com\/(\w+)\/status\/(.+)$/;
  var regFacebookPost = /^https:\/\/www\.facebook\.com\/([^\/]+)\/posts\/(\d+)$/;
  var regYouTubeVideo = /^https:\/\/www\.youtube\.com\/watch\?v=([-\w]+)$/;
  var regUrl = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;

  //var self = this;
  var type = 'unknown';

  if(regTweet.test(_url)){
    type = 'tweet';
    var arr = regTweet.exec(_url);
    twitter.process(arr[2], callback);
  }
  else if(regFacebookPost.test(_url)){
    type = 'facebook';
  }
  else if(regYouTubeVideo.test(_url)){
    type = 'youtube';
  }
  else if(regUrl.test(_url)){
    type = 'url';
  }

  callback(null, type);
}

/**
 * Process 
 */
exports.process = function () {
  console.log('processing');
  redis.lpop('queue:content').then(function(item){
    redis.rpush('queue:content', item);
    redis.hmget('content:'+item, 'url').then(function(url){
      getUrlType(url, function(err, data){
        redis.hmset('content:'+item, 'timestamp',  Date.now());
      });
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
