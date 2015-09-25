'use strict';

/**
 * Module dependencies.
 */
var knex = require('config/lib/knex').knex,
  twitterService = require('modules/core/server/twitter.service'),
  config = require('config/config'),
  redis = require('config/lib/redis'),
  _ = require('lodash'),
  youtubeanalytics = require('modules/core/server/youtubeanalytics.service'),
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
 * Next
 */
exports.next = function (req, res) {
  var _self = this;
  var key = 'queue:linked:account';

  return redis.rpoplpush(key, key)
    .then(function(item){
      if(_.isUndefined(item)){
        console.log('undefined');
        return 'empty list';
      }
      console.log('queue:linked:account -> ', item);
      return LinkedAccount.get(item)
      .then(function(account){
        console.log('account:', account.data.provider_user_id);
        if(account.data.provider_key === 'twitter'){
          console.log('id:', account.data.provider_user_id);
          return twitterService.showUser(account.data.provider_user_id)
            .then(function(user){
              console.log('show user: ', account);
              console.log('updating ' + user.id_str + '===' + account.data.provider_user_id);
              if(user.id_str === account.data.provider_user_id){
                console.log('updating', account);
                account.data.provider_user_name = user.screen_name;
                account.data.provider_user_image_url = user.profile_image_url_https;
                return account.update();
              }
              return 'no op';
            });
        }
        return {};
      })
      .then(function(result){
        console.log('update result ', result);
        res.json(result);
      });
    })
    .catch(console.log.bind(console));
};


/**
 * Add all content to the queue
 */
exports.process = function () {
  var _self = this;
  var key = 'queue:linked:account';

  return redis.rpoplpush(key, key)
    .then(function(item){
      if(_.isUndefined(item)){
        console.log('undefined');
        return 'empty list';
      }
      console.log('queue:linked:account -> ', item);
      return LinkedAccount.get(item)
      .then(function(account){
        if(account.data.provider_key === 'twitter'){
          console.log('id:', account.data.provider_user_id);
          return twitterService.showUser(account.data.provider_user_id)
            .then(function(user){
//              console.log('show user: ', account);
//              console.log('updating ' + user.id_str + '===' + account.data.provider_user_id);
              if(user.id_str === account.data.provider_user_id){
//                console.log('updating', account);
                account.data.provider_user_name = user.screen_name;
                account.data.provider_user_image_url = user.profile_image_url_https;
                return account.update();
              }
              return 'no op';
            });
        }
        return {};
      })
      .then(function(result){
        return result;
      });
    })
    .catch(console.log.bind(console));
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
