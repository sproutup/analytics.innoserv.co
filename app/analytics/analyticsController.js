/**
 * Module dependencies.
 */

//var mongoose = require('mongoose')
//var Article = mongoose.model('Article')
//var utils = require('../../lib/utils')
//var extend = require('util')._extend
require('../../models/analyticsAccount');

/**
 * Load
 */

module.exports.validateAll = function (){
    console.log("## validate all accounts ##");
    Bookshelf.collection('AnalyticsAccountCollection')
        .forge()
        //.where({is_valid: 0})
            //.query('where', 'is_valid', '=', '0')
        .fetch()
        .then(function (result) {
            result.each(function(item){
                item.validate();
            });
        })
    .catch(function (err) {
        console.log('error');
    });
};

module.exports.updateAll = function (){
    console.log("## update all accounts  ##");
    Bookshelf.collection('AnalyticsAccountCollection')
        .forge()
        //.where({is_valid: 0})
            //.query('where', 'is_valid', '=', '0')
        .fetch()
        .then(function (result) {
            result.each(function(item){
               item.update();
            });
        })
    .catch(function (err) {
        console.log('error');
    });

//  var analyticsAccounts = mongoose.model('User');
//
//  Article.load(id, function (err, article) {
//    if (err) return next(err);
//    if (!article) return next(new Error('not found'));
//    req.article = article;
//    next();
//  });
};

