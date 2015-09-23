'use strict';

/**
 * Module dependencies.
 */
var knex = require('config/lib/knex').knex,
  config = require('config/config'),
  redis = require('config/lib/redis'),
  _ = require('lodash'),
  twitterService = require('modules/core/server/twitter'),
  errorHandler = require('modules/core/server/errors.controller');

//var Promise = require('bluebird');
var LinkedAccount = require('./linkedAccount.model');

/**
 * Show the current content item
 */
exports.read = function (req, res) {
  res.json(req.content);
};


/**
 * List of Linked Accounts
 */
exports.list = function (req, res) {
  LinkedAccount.findAllTwitterAccounts()
    .then(function(data){
      res.json({error: false, data: data});
    })
    .catch(function(err){
       return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    });
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
 * Add new items to the queue
 */
exports.addLatest = function (latest_id) {
  var _self = this;

  return knex.select('id').from('linked_account')
    .where('id', '>', latest_id)
    .orderBy('id', 'asc')
    .limit(10)
    .then(function(rows) {
      return _.pluck(rows, 'id');
    })
    .then(function(array){
      if(array.length > 0){
        console.log('found new linked account: ', array);
        redis.lpush('queue:linked:account', array);
        // last element
        return array[array.length - 1];
      }
      else{
        return -1;
      }
    })
    .then(function(res){
      if(res > 0){
        var key = 'queue:linked:account:latest';
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
exports.setLatestId = function(id, callback){
  var key = 'queue:linked:account:latest';
  redis.set(key, id);
  callback(null);
};


/*
 *
 */
exports.getLatestId = function(){
  var key = 'queue:linked:account:latest';
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
 * Update queue
 */
exports.update = function(){
  var _self = this;
  _self.getLatestId()
      .then(_self.addLatest)
      .then(function(result){
        return result;
      });
};

/**
 * Add all content to the queue
 */
exports.process = function () {
  var _self = this;
  redis.lpop('queue:linked:account').then(function(item){
    if(_.isUndefined(item)){
      console.log('undefined');
      return 'done';
    }
    redis.rpush('queue:linked:account', item);
    console.log('item', twitterService);
    LinkedAccount.get(item)
    .then(function(result){
      if(result.provider_key === 'twitter'){
        console.log('twitter_id', result);
        twitterService.showUser('1234')  //result.provider_user_id)
        .then(function(user){
          console.log(user);
        });
      }
    });
  })
  .catch(function (err) {
  });
};

/**
 * Content middleware
 */
exports.linkedAccountByID = function (req, res, next, id) {
  LinkedAccount.get(id).then(function(result){
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