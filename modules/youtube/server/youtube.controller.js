'use strict';

/**
 * Module dependencies.
 */

var dynamoose = require('dynamoose');
var Network = dynamoose.model('Network');
var OAuth = dynamoose.model('oauth');
var Promise = require('bluebird');
var youtubeService = require('./youtube.service');
var errorHandler = require('modules/core/server/errors.controller');
var _ = require('lodash');

/**
 * Show
 */
exports.listVideosByUser = function (req, res) {
  res.json([]);
};

/**
 * Video List
 */
exports.listVideos = function (req, res) {
  console.log('[Youtube] list videos');
  var maxResults = 10;

  var result = {
    total: 0,
    resultsPerPage: maxResults,
    items : []
  };

  Promise.join(
      Network.get({userId: req.userId, provider: 'yt'}),
      OAuth.getAccessToken(req.userId, 'yt'),
      function(network, account){
        return youtubeService.search(account.accessToken, 'id, snippet', maxResults);
      }
    )
    .then(function(data){
      result.items = data.items;
      result.total = data.items.length;
      res.json(result);
    })
    .catch(function(err){
      res.json(err);
    });
};


