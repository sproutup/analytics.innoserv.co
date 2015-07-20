
/**
 * Module dependencies.
 */

//var mongoose = require('mongoose')
//var Article = mongoose.model('Article')
//var utils = require('../../lib/utils')
//var extend = require('util')._extend

/**
 * Load
 */

exports.loadAll = function (){
  var analyticsAccounts = mongoose.model('User');

  Article.load(id, function (err, article) {
    if (err) return next(err);
    if (!article) return next(new Error('not found'));
    req.article = article;
    next();
  });
};

