'use strict';

var knex = require('config/lib/knex').knex,
  redis = require('config/lib/redis'),
  Promise = require('bluebird'),
  _ = require('lodash');

var YoutubeChannel = function(data) {
  this.id = -1;
  this.schema = {
    id: null,
    id_str: null,
    user_id: null,
    title: null,
    description: null,
    published_at: null,
    thumbnail_url: null
  };
  this.data = this.sanitize(data);
};

YoutubeChannel.prototype.sanitize = function (data) {
  data = data || {};
  return _.pick(_.defaults(data, this.schema), _.keys(this.schema));
};

YoutubeChannel.prototype.key = function(){
  var key = 'youtube:channel:' + this.id;
  return key;
};

YoutubeChannel.key = function(id){
  var key = 'youtube:channel:' + id;
  return key;
};

YoutubeChannel.prototype.update = function(){
  var _self = this;
  console.log('updating: ', _self.data.id);
  this.data = this.sanitize(this.data);
  return knex('youtube_channel')
    .where('id', _self.data.id)
    .update(_.omit(_self.data, ['id']))
    .then(function(){
      redis.del('youtube:channel:'+_self.data.id);
      return _self.data;
    });
};

YoutubeChannel.prototype.insert = function(){
  var _self = this;
  this.data = this.sanitize(this.data);
  return knex('youtube_channel')
    .insert(_.omit(_self.data, ['id']));
};

YoutubeChannel.prototype.setCache = function(){
  var _self = this;
  return redis.hmset(this.key(), this.data)
    .then(function(result){
      return _self;
    });
};

YoutubeChannel.prototype.loadFromCache = function(){
  var _self = this;
  return redis.hgetall(this.key())
    .then(function(result){
      _self.data = result;
      return _self;
    });
};

YoutubeChannel.prototype.existsCache = function(){
  return redis.exists(this.key());
};

YoutubeChannel.prototype.loadFromDB = function(id){
  var _self = this;
  console.log('id: ', id);
  return knex('youtube_channel')
    .where('id', id)
    .first()
    .then(function(result){ 
      console.log('load from DB: ', result.id);
      _self.data = result;
      return _self;
    });
};

YoutubeChannel.forge = function(id){
  return new Promise(function(resolve){
    var item = new YoutubeChannel();
    item.id = id;
    resolve(item);
  });
};

/*
 * try to load from from cache otherwise load from DB
 * and then add to cache
 */
YoutubeChannel.get = function(id){
  var item = new YoutubeChannel();
  item.id = id;
  return item.existsCache(id)
    .then(function(result){
      if(result===1){
        // load from cache
        return item.loadFromCache(id);
      }
      // load from db
      return item.loadFromDB(id)
        .then(function(result){
          // add to cache
          return item.setCache();
        })
        .then(function(result){
          return item;
        });
    });
};

module.exports = YoutubeChannel;
