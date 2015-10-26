'use strict';

/**
 * Module dependencies.
 */
var controller = require('./network.controller');

module.exports = function (app) {
  // Articles collection routes
  app.route('/api/network')
    .get(controller.list);
//    .post(controller.create);

  app.route('/api/network/:provider/:userId/connect')
    .get(controller.connect);

  app.route('/api/user/:userId/network/:provider')
    .get(controller.read)
		.delete(controller.delete);

  app.route('/api/network/callback/:token')
    .post(controller.create);

  // Single article routes
  app.route('/api/network/user/:userId')
    .get(controller.read)
    .delete(controller.delete);

  // Finish by binding the middleware
  app.param('userId', controller.networkByUserID);
  app.param('token', controller.networkByToken);
  app.param('provider', controller.networkByProvider);
};
