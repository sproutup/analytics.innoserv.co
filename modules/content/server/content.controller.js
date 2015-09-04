'use strict';

/**
 * Module dependencies.
 */
var bookshelf = require('config/lib/bookshelf').bookshelf,
  Content = bookshelf.model('Content'),
  Contents = bookshelf.collection('ContentCollection'),
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
      collection.each(function(item){
        //console.log(JSON.stringify(item));
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


