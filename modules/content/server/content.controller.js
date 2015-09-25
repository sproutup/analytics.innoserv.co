'use strict';

/**
 * Module dependencies.
 */
var knex = require('config/lib/knex').knex,
  config = require('config/config'),
  redis = require('config/lib/redis'),
  _ = require('lodash'),
  errorHandler = require('modules/core/server/errors.controller');
var TwitterService = require('modules/core/server/twitter.service');
var YoutubeAnalyticsService = require('modules/core/server/youtubeanalytics.service');
var P = require('bluebird');
var Content = require('./content.model');
var ContentP = P.promisifyAll(Content);


/**
 * Show the current content item
 */
exports.read = function (req, res) {
  var result = req.content;
  var type = result.getType();
  switch(type.type){
    case 'tweet':
      TwitterService.process(result, type);
      break;
    case 'url':
      break;
    case 'youtube':
      YoutubeAnalyticsService.process(result, type);
      break;
  }
 
  res.json(req.content);
};


/**
 * List of Content
 */
exports.list = function (req, res) {
  console.log('content list', Content);
//  Content.findAll(function(err, data){    
//    res.json({error: false, data: data});
//  });

  Content.findAll()
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
 * Update content queue
 */
var update = function(){
  var _self = this;
  return _self.getLatestContentId()
      .then(_self.addLatestContent)
      .then(function(result){
        return result;
      });
}

/**
 * Add all content to the queue
 */
exports.init = function (req, res) {
  var _self = this;
  this.update().then(function(){
    res.json({});
  });
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

exports.next = function (req, res){
  return redis.llen('queue:content').then(function(val){
    if(val==='0'){
      return {len: val};
    }
    else{
      return redis.rpoplpush('queue:content','queue:content')
        .then(Content.get)
        .then(function(result){
          result.getType();
          return result;
        });
    }
  });
//  .then(function(result){
//    console.log('res:',result);
//    return result;
//  })
//  .catch(function (err) {
//    res.json({err: err});
//  })
//  .onPossiblyUnhandledRejection(function(e, promise) {
//        throw e;
//  });

};

/**
 * Add new content to the queue
 */
exports.addLatestContent = function (latest_id) {
  var _self = this;

  return knex.select('id').from('content')
    .where('id', '>', latest_id)
    .orderBy('id', 'asc')
    .limit(10)
    .then(function(rows) {
      return _.pluck(rows, 'id');
    })
    .map(function(id){
      Content.addToList(id);
    })
/*    .then(function(array){
      if(array.length > 0){
        console.log('found new content: ', array);
        redis.lpush('queue:content', array);
        // last element
        return array[array.length - 1];
      }
      else{
        return -1;
      }
    }) */
    .then(function(res){
      if(res > 0){
        var key = 'content:queue:latest';
        redis.set(key, res);
        return res;
      }
      else{
        return -1;
      }
    })
    .catch(function(err){
      // todo
    });
};

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
exports.getLatestContentId = function(){
  var key = 'content:queue:latest';
  return redis.get(key)
      .then(function(result){
        if (result === null){
            return -1;
        }
        else{
            return result;
        }
      });
};

/**
 * Update content queue
 */
exports.update = function(){
  var _self = this;
  return _self.getLatestContentId()
      .then(_self.addLatestContent)
      .then(function(result){
        return result;
      });
//  _self.getLatestContentId(function(err, result){
//    _self.addLatestContent(result, function(err, result){
//      console.log('content result:', result);
//    });
//  });
//    Contents.forge()
//      .where('id', '>', 10)
//      .fetch()
//      .then(function(collection){
//        collection.each(function(item){      
//          console.log('item: ', item.id);
//        });
//      });
//    callback(null);
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
 * process next content in the queue
 */
exports.process = function () {
  return redis.llen('queue:content').then(function(val){
    if(val==='0'){
      return {len: val};
    }
    else{
      return redis.rpoplpush('queue:content','queue:content')
        .then(Content.get)
        .then(function(result){
          var type = result.getType();
          switch(type.type){
            case 'tweet':
//              return TwitterService.process(result, type);
            case 'url':
              break;
            case 'youtube':
              break;
          }
          return result;
        });
    }
  });

/* redis.lpop('queue:content').then(function(item){
    redis.rpush('queue:content', item);
    Content.get(item);
    redis.hmget('content:'+item, 'url').then(function(url){
      console.log('content: ' + item + ' ' + getUrlType(url).type + ':' + url);
      var type = getUrlType(url);
      redis.hmset('content:'+item, 'timestamp',  Date.now());
    });
  })
  .catch(function (err) {
  }); */
};

/**
 * Content middleware
 */
exports.contentByID = function (req, res, next, id) {

  Content.get(id).then(function(result){
    req.content = result;
    next();
  });

//  if (!mongoose.Types.ObjectId.isValid(id)) {
//    return res.status(400).send({
//      message: 'Article is invalid'
//    });
//  }
//
//  Article.findById(id).populate('user', 'displayName').exec(function (err, article) {
//    if (err) {
//      return next(err);
//    } else if (!article) {
//      return res.status(404).send({
//        message: 'No article with that identifier has been found'
//      });
//    }
//    req.article = article;
//    next();
//  });
};
