'use strict';

var knex = require('config/lib/knex').knex,
  redis = require('config/lib/redis'),
  _ = require('lodash');

var LinkedAccount = function() {
  this.data = {id: -1};
  this.id = -1;
};

LinkedAccount.prototype.get = function(id){
  console.log('get linked account', id);
};

LinkedAccount.prototype.key = function(){
  var key = 'linked:account:' + this.id;
  console.log(key);
  return key;
};

LinkedAccount.key = function(id){
  var key = 'linked:account:' + id;
  return key;
};

LinkedAccount.prototype.update = function(){
  var _self = this;
  console.log('updating: ', _self.data.id);
  return knex('content')
    .where('id', _self.data.id)
    .update(_.pick(_self.data, ['url', 'updated_at']));
};

LinkedAccount.prototype.insert = function(){
  var _self = this;
  return knex('content')
    .insert(_.omit(_self.data, ['id', 'timestamp', 'product_trial_id']));
};

LinkedAccount.prototype.setCache = function(){
  var _self = this;
  return redis.hmset(this.key(), this.data)
    .then(function(result){
      return _self;
    });
};

LinkedAccount.prototype.loadFromCache = function(){
  var _self = this;
  return redis.hgetall(this.key())
    .then(function(result){
      _self.data = result;
      return result;
    });
};

LinkedAccount.prototype.existsCache = function(){
  return redis.exists(this.key());
};

LinkedAccount.prototype.loadFromDB = function(id){
  var _self = this;
  console.log('id: ', id);
  return knex('linked_account')
    .where('id', id)
    .first()
    .then(function(result){ 
      console.log('load from DB: ', result);
      _self.data = result;
      return result;
    });
};

LinkedAccount.findAllTwitterAccounts = function (){
  console.log('findAllTwitterAccounts()');
  return knex.select('*')
    .from('linked_account')
    .where('provider_key', 'twitter');
};

LinkedAccount.forge = function(id){
  return new Promise(function(resolve){
    var item = new LinkedAccount();
    item.id = id;
    resolve(item);
  });
};

/**
 * Add all content to the queue
 */
LinkedAccount.next = function () {
  var _self = this;
  redis.lpop('queue:linked:account').then(function(item){
    console.log('next: ', item);
/*    if(_.isUndefined(item)){
      console.log('undefined');
      return item;
    }
    console.log('found: ', item); */
    redis.rpush('queue:linked:account', item);
    return LinkedAccount.get(item);
  })
  .catch(function (err) {
  });
};

/*
 * try to load from from cache otherwise load from DB
 * and then add to cache
 */
LinkedAccount.get = function(id){
  var item = new LinkedAccount();
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

module.exports = LinkedAccount;
