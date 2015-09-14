'use strict';

var knex = require('config/lib/knex').knex,
  redis = require('config/lib/redis');

var Content = function() {
//  this.firstName = firstName;
};

Content.prototype.get = function(id){
  console.log('get content', id);
};

Content.prototype.sayHello = function(){
  console.log('Hello, Im ' + this.firstName);
};

Content.findAll = function (callback){
  console.log('findAll()');
  return knex.select('*')
    .from('content')
    .nodeify(callback);
};

Content.get = function(id, callback){
  var key = 'content:' + id;
  console.log(key);
  redis.exists(key).then(function(result){
    console.log('##exists: ', result);
    if(result === '1'){
      // cache hit
      redis.hmget(key, 'url')
        .then(function(url){
          console.log('url:', url);
          return url;
        });
    }
    else{
      // cache miss
      return knex('content')
        .where('id', id).then(function(result){
          console.log('knex res: ', result);
          //if()
          return result;
        }).nodeify(callback);
    }
  }).nodeify(callback);
};

module.exports = Content;
