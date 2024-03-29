'use strict';

/**
 * Module dependencies.
 */
var controller = require('./network.controller');

module.exports = function (app) {
  // Articles collection routes
  app.route('/api/network')
    .get(controller.listAll);
//    .post(controller.create);

  app.route('/api/network/:provider/:userId/connect')
    .get(controller.connect);
/*
  app.route('/api/user/:userId/network/:provider')
    .get(controller.read)
    .post(controller.update)
    .delete(controller.delete);
*/
  app.route('/api/network/callback/:token')
    .post(controller.create);

  // Collection routes
  app.route('/api/user/:userId/network')
    .get(controller.list);

  // Collection routes
  app.route('/api/network/:provider/init')
    .get(controller.init);

  // Collection routes
  app.route('/api/network/:provider/next')
    .get(controller.next);

  // Single network routes
  app.route('/api/user/:userId/network/:provider')
    .post(controller.connect)
    .get(controller.read)
    .put(controller.update)
    .delete(controller.delete);

  // Single network routes
  app.route('/api/user/:userId/network/:provider/account')
    .get(controller.readAccount)
    .put(controller.updateAccount);


  // Single article routes
  app.route('/api/user/:userId/network/:provider/stats')
//    .post(controller.connect)
    .get(controller.readStats);
//    .put(controller.update);



  // Single article routes
  app.route('/api/network/user/:userId')
    .get(controller.read)
    .delete(controller.delete);

  // Finish by binding the middleware
  app.param('userId', controller.networkByUserID);
  app.param('token', controller.networkByToken);
  app.param('provider', controller.networkByProvider);
};
