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
};
