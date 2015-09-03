'use strict';

/**
 * Module dependencies.
 */
var //articlesPolicy = require('../policies/articles.server.policy'),
  account = require('./analyticsAccount.controller');

module.exports = function (app) {
  // Articles collection routes
  app.route('/api/analytics/account')//.all(articlesPolicy.isAllowed)
    .get(account.list)
    .post(account.create);

  // Single article routes
//  app.route('/api/articles/:articleId')//.all(articlesPolicy.isAllowed)
//    .get(articles.read)
//    .put(articles.update)
//    .delete(articles.delete);

  // Finish by binding the article middleware
  //app.param('accountId', account.accountByID);
};
