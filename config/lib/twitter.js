'use strict';

var Twit = require('twit'),
    config = require('config/config');

var T = new Twit({
      consumer_key:         config.twitter.clientID
    , consumer_secret:      config.twitter.clientSecret
    , access_token:         config.twitter.accessID
    , access_token_secret:  config.twitter.accessSecret
})

module.exports = T;
