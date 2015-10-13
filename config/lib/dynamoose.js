'use strict';

var dynamoose = require('dynamoose');
var config = require('../config');
var chalk = require('chalk');

console.log('--');
console.log(chalk.green('Dynamodb'));
console.log(chalk.green('Local:\t', config.dynamodb.local));

dynamoose.AWS.config.update({
  accessKeyId: 'AKID',
  secretAccessKey: 'SECRET',
  region: 'us-east-1'
});

if(config.dynamodb.local === true){
  dynamoose.local();
}

module.exports = dynamoose;