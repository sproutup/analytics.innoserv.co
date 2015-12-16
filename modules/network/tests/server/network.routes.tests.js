'use strict';

require('config/lib/dynamoose').loadModels();

var should = require('should'),
  request = require('supertest'),
  dynamoose = require('dynamoose'),
  bookshelf = require('config/lib/bookshelf'),
  Network = dynamoose.model('Network'),
  express = require('config/lib/express');


/**
 * Globals
 */
var app, agent, credentials, user, verifier;

/**
 * Article routes tests
 */
describe('Network API tests', function () {

  before(function (done) {
    // Get application
    dynamoose.local();
    bookshelf.loadModels();
    bookshelf.connect(function (db){
      app = express.init(db);
      agent = request.agent(app);
      done();
    });
    verifier = 'AQCDgf6W-AImUQk-Q-bJvJinBWNpnWSn6rhBiQYbx1dAPT_TRvMFmT3WO4SF5CHHdMCaYuwT3ex9S9xzXjwc9mBBFgJ21Yimyjwj1tG6OzMbvLhdQClWTCQzJoEbmrzTcsiIZM2H_wsXPaUOwOl_kEzHUNSAJPjRurqvKOL6BApK8dyxkHWHOqSvO9v6ezmVPW_ti-YqsrJ_SI4JKA-iztS32vnU3EJjkMCstRFurL1qzQmhRi71KhKcqMXpFoDAEfJrl-wUwJZkzVVwsd-V-J90y3HxgkykovugbSa9ZoYIVKoHXg3OfsqKNwumlZbXnN2LjVS3OA4yHaKiL3LUfXEu';
  });

  beforeEach(function (done) {
    // Create user credentials
    credentials = {
      username: 'username',
      password: 'M3@n.jsI$Aw3$0m3'
    };
    done();
  });

  it('should be able to request connect url', function (done) {
    agent.post('/api/user/123/network/fb')
      .expect(200)
      .end(function (connectErr, connectRes) {
        // Handle signin error
        if (connectErr) {
          return done(connectErr);
        }

        (connectRes.body.url).should.startWith('https://www.facebook.com/v2.0/dialog/oauth');

        Network.delete({userId: 123, provider: 'fb'}, function(err, data){
          done();
        });
      });
  });

  it('should not be able to create connection with unknown token', function (done) {
    agent.post('/api/network/callback/' + 'notavalidtoken')
      .expect(400)
      .end(function (articleSaveErr, articleSaveRes) {
        // Call the assertion callback
        done(articleSaveErr);
      });
  });

  it('should be able to create connection with valid token', function (done) {
    agent.post('/api/user/123/network/fb')
      .expect(200)
      .end(function (connectErr, connectRes) {
        // Handle signin error
        if (connectErr) {
          return done(connectErr);
        }

        (connectRes.body.url).should.startWith('https://www.facebook.com/v2.0/dialog/oauth');

        Network.get({userId: 123, provider: 'fb'}, function(err, data){
          agent.post('/api/network/callback/' + data.token)
            .send({verifier: verifier})
            .expect(200)
            .end(function (articleSaveErr, articleSaveRes) {
              // Call the assertion callback
              console.log(articleSaveRes.body);
              done(articleSaveErr);
            });
        });
      });
  });

/*
  it('should not be able to save an article if no title is provided', function (done) {
    // Invalidate title field
    article.title = '';

    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new article
        agent.post('/api/articles')
          .send(article)
          .expect(400)
          .end(function (articleSaveErr, articleSaveRes) {
            // Set message assertion
            (articleSaveRes.body.message).should.match('Title cannot be blank');

            // Handle article save error
            done(articleSaveErr);
          });
      });
  });

  it('should be able to update an article if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new article
        agent.post('/api/articles')
          .send(article)
          .expect(200)
          .end(function (articleSaveErr, articleSaveRes) {
            // Handle article save error
            if (articleSaveErr) {
              return done(articleSaveErr);
            }

            // Update article title
            article.title = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing article
            agent.put('/api/articles/' + articleSaveRes.body._id)
              .send(article)
              .expect(200)
              .end(function (articleUpdateErr, articleUpdateRes) {
                // Handle article update error
                if (articleUpdateErr) {
                  return done(articleUpdateErr);
                }

                // Set assertions
                (articleUpdateRes.body._id).should.equal(articleSaveRes.body._id);
                (articleUpdateRes.body.title).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of articles if not signed in', function (done) {
    // Create new article model instance
    var articleObj = new Article(article);

    // Save the article
    articleObj.save(function () {
      // Request articles
      request(app).get('/api/articles')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single article if not signed in', function (done) {
    // Create new article model instance
    var articleObj = new Article(article);

    // Save the article
    articleObj.save(function () {
      request(app).get('/api/articles/' + articleObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('title', article.title);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single article with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/articles/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Article is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single article which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent article
    request(app).get('/api/articles/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No article with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an article if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new article
        agent.post('/api/articles')
          .send(article)
          .expect(200)
          .end(function (articleSaveErr, articleSaveRes) {
            // Handle article save error
            if (articleSaveErr) {
              return done(articleSaveErr);
            }

            // Delete an existing article
            agent.delete('/api/articles/' + articleSaveRes.body._id)
              .send(article)
              .expect(200)
              .end(function (articleDeleteErr, articleDeleteRes) {
                // Handle article error error
                if (articleDeleteErr) {
                  return done(articleDeleteErr);
                }

                // Set assertions
                (articleDeleteRes.body._id).should.equal(articleSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an article if not signed in', function (done) {
    // Set article user
    article.user = user;

    // Create new article model instance
    var articleObj = new Article(article);

    // Save the article
    articleObj.save(function () {
      // Try deleting article
      request(app).delete('/api/articles/' + articleObj._id)
        .expect(403)
        .end(function (articleDeleteErr, articleDeleteRes) {
          // Set message assertion
          (articleDeleteRes.body.message).should.match('User is not authorized');

          // Handle article error error
          done(articleDeleteErr);
        });

    });
  });
*/

  afterEach(function (done) {
    Network.delete({userId: 123, provider: 'fb'}, function(err, data){
      done();
    });
  });
});
