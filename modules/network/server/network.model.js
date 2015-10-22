'use strict';

/**
 *  * Module dependencies.
 *   */
var dynamoose = require('config/lib/dynamoose');
var Schema = dynamoose.Schema;

/**
 *  * User Reach Schema
 *   */
var NetworkSchema  = new Schema({
  userId: {
    type: Number,
    validate: function(v) { return v > 0; },
    hashKey: true
  },
  provider: {
    type: String,
    rangeKey: true,
    index: true
  },
  'key': String,
  'secret': String
},
{
  throughput: {read: 15, write: 5}
});

dynamoose.model('Network', NetworkSchema);
