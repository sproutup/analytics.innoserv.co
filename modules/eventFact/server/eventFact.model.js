'use strict';

var knex = require('config/lib/knex').knex,
  redis = require('config/lib/redis');

var EventFact = function() {
  this.data = {id: -1};
};

EventFact.prototype.get = function(id){
  console.log('get content', id);
};

EventFact.prototype.key = function(){
  var key = 'content:' + this.data.id;
  return key;
};

EventFact.key = function(id){
  var key = 'eventFact:' + id;
  return key;
};

EventFact.prototype.setCache = function(){
  var _self = this;
  return redis.hmset('content:' + this.data.id, _self.data)
    .then(function(result){
      return _self;
    });
};

EventFact.prototype.loadFromCache = function(id){
  var _self = this;
  return redis.hgetall('content:' + id)
    .then(function(result){
      console.log('getCache:', result);
      _self.data = result;
      return result;
    });
};

EventFact.prototype.checkCache = function(id){
  var _self = this;
  return redis.exists('content:' + id);
};

EventFact.prototype.loadFromDB = function(id){
  var _self = this;
  return knex('content')
    .where('id', id)
    .first()
    .then(function(result){ 
      console.log('load from DB: ', result);
      _self.data = result;
      return _self;
    });
};

EventFact.prototype.save = function(){
  var _self = this;
  return knex('event_fact')
    .insert(_self.data)
    .then(function(result){ 
      console.log('saved:', result);
      _self.data.id = result[0];
      return _self.data.id;
    });
};

EventFact.findAll = function (callback){
  console.log('findAll()');
  return knex.select('*')
    .from('content')
    .nodeify(callback);
};


/*
 * try to load from from cache otherwise load from DB
 * and then add to cache
 */
EventFact.get = function(id){
  var item = new EventFact();

  return item.checkCache(id)
    .then(function(result){
      if(result===1){
        // load from cache
        return item.loadFromCache(id);
      }
      else{
        // load from db
        return item.loadFromDB(id)
          .then(function(result){
            // add to cache
            return item.setCache();
          })
          .then(function(result){
            return item.data;
          });
      }
    });
};

module.exports = EventFact;
