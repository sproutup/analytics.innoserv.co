'use strict';

/**
 * Module dependencies.
 */
var controller = require('./user-reach.controller');

module.exports = function (app) {
  // Articles collection routes
  app.route('/api/user/reach')
    .get(controller.list);
//    .post(controller.create);
/*
  // Single article routes
  app.route('/api/articles/:articleId')
    .get(controller.read)
    .put(controller.update)
    .delete(controller.delete);
*/
  // Finish by binding the article middleware
//  app.param('articleId', controller.userReachByID);
};
