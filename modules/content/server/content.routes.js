'use strict';

/**
 * Module dependencies.
 */
var //articlesPolicy = require('../policies/articles.server.policy'),
  content = require('./content.controller');

module.exports = function (app) {
  // Articles collection routes
  app.route('/api/content') //.all(articlesPolicy.isAllowed)
    .get(content.list);

  app.route('/api/content/init') //.all(articlesPolicy.isAllowed)
    .get(content.init);

  // Single content routes
  app.route('/api/content/:contentId')//.all(articlesPolicy.isAllowed)
    .get(content.read);

  // Finish by binding the content middleware
  app.param('contentId', content.contentByID);
};
