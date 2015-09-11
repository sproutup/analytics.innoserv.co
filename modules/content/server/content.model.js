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

Content.findAll = function (){
  console.log('findAll()');
  return knex.select('*')
    .from('content')
    .then(function(data){return data;});

/*    .then(function(data) {
      return callback(null, data);
    })
    .catch(function(err){
      return callback(err);
    }); */
};

Content.get = function(id){
  var key = 'content:' + id;
  console.log(key);
  redis.exists(key).then(function(result){
    console.log('##exists: ', result);
    redis.hmget(key, 'url')
      .then(function(url){
        console.log('url:', url);
      });
  });
};

module.exports = Content;
