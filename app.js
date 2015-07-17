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


var app = express();
var dbConfig = {
    client: 'mysql',
    connection: {
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'sproutup_db',
        charset: 'utf8'
    }
};
 
var knex = require('knex')(dbConfig);
var bookshelf = require('bookshelf')(knex);
 
app.set('bookshelf', bookshelf);

var eventFact = require('./models/event');

//var MyModel = bookshelf.model('MyModel');



// Dev
//var CLIENT_ID = "200067319298-cpblm10r8s9o29kjgtahjek2eib7eigk.apps.googleusercontent.com";
//var CLIENT_SECRET = "nQ4NK9cKoPl8fWXDF9V-PsTU";
//var REDIRECT_URL = "http://localhost:9000/oauth2callback";

// Prod
var CLIENT_ID = "200067319298-gu6eos6o5cmeaat2tsmlu1s6rk5gjpnd.apps.googleusercontent.com";
var CLIENT_SECRET = "kN13wxKxV1RuIFsPDnr2Y8H8";
var REDIRECT_URL = "http://www.sproutup.co/oauth2callback";

var OAuth2 = google.auth.OAuth2;
var oauth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);

//Retrieve tokens via token exchange explained above or set them:
 oauth2Client.setCredentials({
     access_token: 'ya29.swF3k3A-4ZcyWv3EuPNtlci3i00I5Oq0c-SZcF2AS7kK6YRTEj5y2LefNeLidQ4ztzqTaQ',
     refresh_token: '1/4zz2P5wkWRWx3r3ZKEQBqUKGm3kMGwc2gbzM-w9u0SlIgOrJDtdun6zK6XiATCKT'
 });

// oauth2Client.setCredentials({
//     access_token: 'ya29.sgGon90bYdz5e27ODCVWcACRcDPeDl7i8wD1uP8CrdeyDptZ-wMYntfnxfVGXBRbotwZ'
// });

// oauth2Client.setCredentials({
//     access_token: 'ya29.sgGk80KyWx_bjTcYd6J6WNk2_6qORFEBPacVkDbhOqXIRHEfd_EpIsw11u6SrUkC7nnf',
//     refresh_token: '1/29EJ6NB7F4IL34je4dveFIs0Lse_mMBZ_Uz11YDJdu5IgOrJDtdun6zK6XiATCKT'
// });

//oauth2Client.refreshAccessToken(function(err, tokens) {
//   // your access_token is now refreshed and stored in oauth2Client
//   // store these new tokens in a safe place (e.g. database)
//   console.log("err", err);
//   console.log("tokens", tokens);
//});


google.options({ auth: oauth2Client }); // set auth as a global default

var API_KEY = 'AIzaSyDnnN1fL1vkptQQLdTL17pFrnH3XOlDNdo'; // specify your API key here
var params = { auth: API_KEY, shortUrl: 'http://goo.gl/xKbRu3' };

// get the long url of a shortened url
// urlshortener.url.get(params, function (err, response) {
//    if (err) {
//        console.log('Encountered error', err);
//    } else {
//        console.log('Long url is', response.longUrl);
//    }
// });

// analytics.data.ga.get({auth: oauth2Client, ids: 'ga:65112246', 'start-date': '30daysAgo', 'end-date':'yesterday', metrics:'ga:uniquePageViews', dimensions:'ga:date,ga:pagePath'}, function(err, response){
//    if (err) {
//        console.log('Encountered error', err);
//    } else {
//        console.log('Long url is', response);
//    }
// })

analytics.management.accountSummaries.list({auth: oauth2Client}, function(err, response){
   if (err) {
       console.log('Encountered error', err);
   } else {
       console.log('Long url is', response);
   }
})


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
