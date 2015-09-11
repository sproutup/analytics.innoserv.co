'use strict';

/**
 * Module dependencies.
 */
var knex = require('config/lib/knex').knex,
  config = require('config/config'),
  redis = require('config/lib/redis'),
  _ = require('lodash'),
  errorHandler = require('modules/core/server/errors.controller');

var P = require('bluebird');
var Content = require('./content.model');
var ContentP = P.promisifyAll(Content);

/**
 * List of Content
 */
exports.list = function (req, res) {
  console.log('content list', Content);
//  Content.findAll(function(err, data){    
//    res.json({error: false, data: data});
//  });

  ContentP.findAll()
    .then(function(data){
      res.json({error: false, data: data});
    })
    .catch(function(err){
       return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    });


//  Contents.forge()
//    .fetch()
//    .then(function (collection) {
//      res.json({error: false, data: collection.toJSON()});
//    })
//    .catch(function (err) {
//      return res.status(400).send({
//        message: errorHandler.getErrorMessage(err)
//      });
//  });
};

/**
 * Add all content to the queue
 */
exports.init = function (req, res) {
  var _self = this;
//  Contents.forge()
//    .fetch()
//    .then(function (collection) {
//      redis.del('queue:content');
//      collection.each(function(item){
//        redis.del('content:'+item.get('id'));
//        redis.hmset('content:'+item.get('id'), 'url', item.get('url'));
//        redis.lpush('queue:content', item.get('id'));
//      });
//      res.json({error: false, data: collection.toJSON()});
//    })
//    .catch(function (err) {
//      return res.status(400).send({
//        message: errorHandler.getErrorMessage(err)
//      });
//  });
};

/**
 * Add new content to the queue
 */
exports.addLatestContent = function (latest_id, callback) {
  var _self = this;

  knex.select('id').from('content')
    .where('id', '>', latest_id)
    .orderBy('id', 'asc')
    .limit(10)
    .then(function(rows) {
      return _.pluck(rows, 'id');
    })
    .then(function(array){
      if(array.length > 0){
//        redis.hmset('content:' + item.id, 'url', item.url, 'timestamp', Date.now());
        console.log('array: ', array);
        redis.lpush('queue:content', array);
        // last element
        return array[array.length - 1];
      }
      else{
        return -1;
      }
    })
    .then(function(res){
      if(res > 0){
        var key = 'content:queue:latest';
        redis.set(key, res);
        callback(null, res);
      }
      else{
        callback(null, -1);
      }
      return;
    })
    .catch(function(err){
      // todo
    });
};

//`  bookshelf.collection('ContentCollection')
//`    .forge()
//`    .where('id', '>', -1)
//`    .fetch()
//`    .then(function (collection) {
//`      redis.del('queue:content');
//`      collection.each(function(item){
//`        redis.del('content:'+item.get('id'));
//`        redis.hmset('content:'+item.get('id'), 'url', item.get('url'), 'timestamp', Date.now());
//`        redis.lpush('queue:content', item.get('id'));
//`      });
//`      callback(null);
//`    })
//`    .catch(function (err) {
//`      callback(err);
//`    });

/*
 *
 */
exports.setLatestContentId = function(id, callback){
  var key = 'content:queue:latest';
  redis.set(key, id);
  callback(null);
};


/*
 *
 */
exports.getLatestContentId = function(callback){
  var key = 'content:queue:latest';
  redis.get(key, function(err, result){
    if(err){
      console.log(err);
      redis.set(key, -1);
      callback(null, '-1');
      return;
    }
    else{
      console.log('latest: ', result);
      if(result === null || result === '-1'){
        redis.set(key, '-1');
        callback(null, '-1');
      }
      else{        
        callback(null, result);
      }
    }
  });
};

/**
 * Update content queue
 */
exports.update = function(callback){
  var _self = this;
  console.log('updating content queue...');
  _self.getLatestContentId(function(err, result){
    _self.addLatestContent(result, function(err, result){
      console.log('content result:', result);
    });
  });
//    Contents.forge()
//      .where('id', '>', 10)
//      .fetch()
//      .then(function(collection){
//        collection.each(function(item){      
//          console.log('item: ', item.id);
//        });
//      });
    callback(null);
//  });
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
    Content.get(item);
    redis.hmget('content:'+item, 'url').then(function(url){
      console.log('content: ' + item + ' ' + getUrlType(url).type + ':' + url);
      var type = getUrlType(url);
      redis.hmset('content:'+item, 'timestamp',  Date.now());
    });
  })
  .catch(function (err) {
  });
};

