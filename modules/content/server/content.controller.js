'use strict';

/**
 * Module dependencies.
 */
var bookshelf = require('config/lib/bookshelf').bookshelf,
  Content = bookshelf.model('Content'),
  Contents = bookshelf.collection('ContentCollection'),
  config = require('config/config'),
  redis = require('config/lib/redis'),
  errorHandler = require('modules/core/server/errors.controller');

/**
 * List of Articles
 */
exports.list = function (req, res) {
  Contents.forge()
    .fetch()
    .then(function (collection) {
      res.json({error: false, data: collection.toJSON()});
    })
    .catch(function (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
  });
};

/**
 * Add all content to the queue
 */
exports.init = function (req, res) {
  Contents.forge()
    .fetch()
    .then(function (collection) {
      redis.del('queue:content');
      collection.each(function(item){
        redis.del('content:'+item.get('id'));
        redis.hmset('content:'+item.get('id'), 'url', item.get('url'));
        redis.lpush('queue:content', item.get('id'));
      });
      res.json({error: false, data: collection.toJSON()});
    })
    .catch(function (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
  });
};

// Return url type
function getUrlType(_url) {
  var regTweet = /^https:\/\/twitter\.com\/(\w+)\/status\/(.+)$/;
  var regFacebookPost = /^https:\/\/www\.facebook\.com\/([^\/]+)\/posts\/(\d+)$/;
  var regYouTubeVideo = /^https:\/\/www\.youtube\.com\/watch\?v=([-\w]+)$/;
  var regUrl = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;

  //var self = this;
  var type = 'unknown';

  if(regTweet.test(_url)){
    type = 'tweet';
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

  return {
    type: type
  };
}

/**
 * Add all content to the queue
 */
exports.process = function () {
  redis.lpop('queue:content').then(function(item){
    redis.rpush('queue:content', item);
    redis.hmget('content:'+item, 'url').then(function(url){
      console.log('content: ' + item + ' ' + getUrlType(url).type + ':' + url);
      var type = getUrlType(url);
      redis.hmset('content:'+item, 'timestamp',  Date.now());
    });
  })
  .catch(function (err) {
  });
};

