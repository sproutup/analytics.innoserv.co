'use strict';

/**
 * Module dependencies.
 */
var path = require('path');
var dynamoose = require('config/lib/dynamoose');

/**
 * List of Articles
 */
exports.list = function (req, res) {
 // Get model
 var UserReach = dynamoose.model('UserReach');

 console.log('user reach controller');

  UserReach.scan().exec().then(function(res){
    console.log('scan: ', res);
  });

  UserReach.scan().exec().then(function(items) {
    console.log('user reach result', items);
    res.json(items);
  })
  .catch(function(err){
    res.json(err);
  });
};
