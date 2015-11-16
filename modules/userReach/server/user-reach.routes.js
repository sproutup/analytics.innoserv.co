'use strict';

/**
 * Module dependencies.
 */
var controller = require('./user-reach.controller');

module.exports = function (app) {
  // Articles collection routes
  app.route('/api/user/:userId/reach')
    .get(controller.list)
    .post(controller.create);

  // Single article routes
  app.route('/api/user/:userId/reach/:provider')
    .get(controller.read)
    .put(controller.update);

  // Finish by binding the middleware
  app.param('userId', controller.userReachByID);
  app.param('provider', controller.reachByProvider);
};
