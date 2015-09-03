'use strict';

/**
 * Module dependencies.
 */
var bookshelf = require('config/lib/bookshelf').bookshelf,
  Content = bookshelf.model('Content'),
  Contents = bookshelf.collection('ContentCollection'),
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


