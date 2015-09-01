'use strict';

/**
 * Module dependencies.
 */
//var should = require('should')
//  mongoose = require('mongoose'),
//  User = mongoose.model('User'),
//  Article = mongoose.model('Article');
//;

var chai = require('chai');
var config = require('../../../../config/config'); 
var bookshelf = require('../../../../config/lib/bookshelf'); 
chai.config.includeStack = true;
 
global.expect = chai.expect;
global.AssertionError = chai.AssertionError;
global.Assertion = chai.Assertion;
global.assert = chai.assert;

/**
 * Globals
 */
var user, article;

/**
 * Unit tests
 */
describe('Article Model Unit Tests:', function () {
  beforeEach(function (done) {
    console.log('before');
/*    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: 'username',
      password: 'password'
    });

    user.save(function () {
      article = new Article({
        title: 'Article Title',
        content: 'Article Content',
        user: user
      });
*/
      done();
//    });
  });

  describe('Array', function() {
    describe('#indexOf()', function () {
      it('should return -1 when the value is not present', function (done) {
        console.log('google_id', config.google.clientID);

        bookshelf.model('AnalyticsAccountCollection')
            .forge()
            //.where({is_valid: 0})
            //.query('where', 'is_valid', '=', '0')
            .fetch()
            .then(function (result) {
                return{
                    result: result
                }
            })
            .catch(function (err) {
                console.log('error');
            });

        assert.equal(1,1);
        assert.equal(-1, [1,2,3].indexOf(5));
        assert.equal(-1, [1,2,3].indexOf(0));
        done();
      });
    });
  });
/*
  describe('Method Save', function () {
    it('should be able to save without problems', function (done) {
      return article.save(function (err) {
        should.not.exist(err);
        done();
      });
    });

    it('should be able to show an error when try to save without title', function (done) {
      article.title = '';

      return article.save(function (err) {
        should.exist(err);
        done();
      });
    });
  });
*/
//  afterEach(function (done) {
/*    Article.remove().exec(function () {
      User.remove().exec(done);
    });*/
//  });
});
