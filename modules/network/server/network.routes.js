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

  app.route('/api/network/:provider/connect')
    .get(controller.connect);

  app.route('/api/network/:provider')
    .post(controller.create);

  // Single article routes
  app.route('/api/network/user/:userId')
    .get(controller.read);

  // Finish by binding the middleware
  app.param('userId', controller.networkByID);
  app.param('provider', controller.networkByProvider);
};
