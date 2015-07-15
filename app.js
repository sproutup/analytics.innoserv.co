var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var google = require('googleapis');
var urlshortener = google.urlshortener('v1');
var analytics = google.analytics('v3');

var CLIENT_ID = "200067319298-cpblm10r8s9o29kjgtahjek2eib7eigk.apps.googleusercontent.com";
var CLIENT_SECRET = "nQ4NK9cKoPl8fWXDF9V-PsTU";
var REDIRECT_URL = "http://localhost:9000/oauth2callback";
var OAuth2 = google.auth.OAuth2;
var oauth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);

// Retrieve tokens via token exchange explained above or set them:
oauth2Client.setCredentials({
    access_token: 'ya29.sQEthdLUUPQqk-eLq2Pzu8vCcNp3y7_Biz3ZElkrywIkCKhiSBIukKjHoaeu2HYOh8aQ',
    refresh_token: ''
});

google.options({ auth: oauth2Client }); // set auth as a global default

var API_KEY = 'AIzaSyDnnN1fL1vkptQQLdTL17pFrnH3XOlDNdo'; // specify your API key here
var params = { auth: API_KEY, shortUrl: 'http://goo.gl/xKbRu3' };

// get the long url of a shortened url
urlshortener.url.get(params, function (err, response) {
   if (err) {
       console.log('Encountered error', err);
   } else {
       console.log('Long url is', response.longUrl);
   }
});

analytics.data.ga.get({ids: 'ga:101052384', 'start-date': '30daysAgo', 'end-date':'yesterday', metrics:'ga:uniquePageViews', dimensions:'ga:date,ga:pagePath'}, function(err, response){
   if (err) {
       console.log('Encountered error', err);
   } else {
       console.log('Long url is', response);
   }
})

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('less-middleware')(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
