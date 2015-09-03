'use strict';

var moment = require('moment');
var _ = require('underscore');
var google = require('googleapis');
var analytics = google.analytics('v3');
var youtube = google.youtube('v3');
var youtubeAnalytics = google.youtubeAnalytics('v1');
//require('./analyticsAccountSummary');
var Bookshelf = require('../../../config/lib/bookshelf').bookshelf;
var oauth2Client = null;
var account = null;

var AnalyticsAccount = Bookshelf.Model.extend({
    tableName: 'analytics_account',
    hasTimestamps: true,

    analyticsAccountSummary: function() {
        // one-to-many         
        this.hasMany('AnalyticsAccountSummary');
    },

    getAll: function () {
        console.log('## check for new accounts  ##');
        Bookshelf.model('AnalyticsAccountCollection')
            .forge()
            //.where({is_valid: 0})
            //.query('where', 'is_valid', '=', '0')
            .fetch()
            .then(function (result) {
                return{
                    result: result
                };
            })
            .catch(function (err) {
                console.log('error');
            });
    },

    update: function() {
        oauth2Client.setCredentials({
            access_token: this.get('access_token'),
            refresh_token: this.get('refresh_token')
        });

        console.log('update account: ', this.id);

        if(this.get('google_analytics_api') === 1) {
            this.updateAccountSummary();
        }

        if(this.get('youtube_analytics_api') === 1) {
            console.log('youtube');
            this.updateYoutubeChannels();
        } 
    },

    validate: function(callback) {
        
        callback = (typeof callback === 'function') ? callback : function() {};

        var self = this;
        
        console.log('validate account', this.get('id'));
        var account = this;
        oauth2Client.setCredentials({
            access_token: this.get('access_token'),
            refresh_token: this.get('refresh_token')
        });

        if(moment().isAfter(this.get('expires_at'))){
            console.log('expired access token - needs refresh');
            oauth2Client.refreshAccessToken(function(err, tokens) {
                // your access_token is now refreshed and stored in oauth2Client
                // store these new tokens in a safe place (e.g. database)
                if(err){
                    console.log('Encountered error', err);
                    account.set('error_message', err.message);
                    account.set('is_valid', 0);
                    account.save();
                    callback(err);
                }
                else{
               
                    console.log('tokens', tokens);
                    account.set('access_token', tokens.access_token);
                    account.set('updated_at', moment().toDate());
                    account.set('expires_at', moment(tokens.expiry_date).toDate());
                    account.set('is_valid', 1);
                    account.set('error_message', '');
                    account.save().then(function(){
                        callback(null, 'saved');
                    });
                }
            });
        }
        else{
            console.log('access token still valid');
            callback(null, 'valid token');
       }
    },

    updateYoutubeChannels: function(callback) {
        var model = this;
        console.log('get yt-analytics', this.id, this.get('youtube_analytics_api') );
//        youtubeAnalytics.reports.query({auth: oauth2Client}, function(err, data){
//            console.log('hello', err);
//        })
       youtube.channels.list({auth: oauth2Client, part: 'id,snippet,statistics', mine: 'true'}, function(err, data){
            if (err) {
                console.log('youtube error: ', err.message, this.id);
                //model.set('error_message', err.message);
                //model.set('youtube_analytics_api', -1);
                //model.save();
                return;
            } 
            console.log('Youtube channels', data); 
            _.each(data.items, function(item){
                console.log('title: ', item);
                Bookshelf.model('AnalyticsAccountSummary')
                .forge({
                    analytics_account_id: model.get('id'),
                    ga_id: item.id,
                })
                .fetch({require: true})
                .then(function(existing) {
                    console.log('summary found', existing.id);
                    existing.set({
                        is_valid: 1,
                        kind: item.kind,
                        name: item.snippet.title,
                        view_count: item.statistics.viewCount,
                        follower_count: item.statistics.subscriberCount
                    })
                    .save().then(function(){
                        console.log('updated...');
                    });
                })
                .catch(function(err){
                    console.log('create new youtube channel: ', err);
                    Bookshelf.model('AnalyticsAccountSummary')
                    .forge({
                        analytics_account_id: model.get('id'),
                        is_valid: 1,
                        kind: item.kind,
                        name: item.snippet.title,
                        view_count: item.statistics.viewCount,
                        follower_count: item.statistics.subscriberCount,
                        ga_id: item.id
                    })
                    .save()
                    .then(function(existing) {
                        console.log('channel saved', existing.id);
                        existing.set({
                       });
                    })
                    .catch(function(err){
                        console.log('channel save failed: ', err);
                    });
 
                });
 
//                var summary = Bookshelf.model('AnalyticsAccountSummary')
//                .forge({
//                    analytics_account_id: model.get('id'),
//                    ga_id: item.id,
//                    kind: item.kind,
//                    name: item.snippet.title,
//                    views: item.statistics.viewCount,
//                    followers: item.statistics.subscriberCount
//                })
//                .save().then(function(model) {
//                    console.log('summary item saved');
//                });
            });
        });
    },

    updateAccountSummary: function(callback) {

        callback = (typeof callback === 'function') ? callback : function() {};

        var self = this;
        var account = this;
        var error_message = '';
        var error = {};
        console.log('## update account summary ##');



        analytics.management.accountSummaries.list({auth: oauth2Client}, function(err, response){
            if (err) {
                console.log('error: ', err.errors[0].message, account.id);
                error = err;
                error_message = err.errors[0].message;
                Bookshelf.model('AnalyticsAccountSummary')
                    .forge({
                        analytics_account_id: account.get('id'),
                        is_valid: 0,
                        kind: 'analytics#accountSummary'
                    })
                    .fetch({require: true})
                    .then(function(item){
                        console.log('updating summary error', error_message);
                        item.set({
                            error_message: error_message,
                        })
                        .save()
                        .then(function(model) {
                            console.log('updated error message');
                            callback(error, null);
                        });
                    })
                    .catch(function (err) {
                        console.log('creating summary error', error_message);
                        Bookshelf.model('AnalyticsAccountSummary')
                        .forge({
                            analytics_account_id: account.get('id'),
                            is_valid: 0,
                            kind: 'analytics#accountSummary',
                            error_message: error_message
                        })
                        .save()
                        .then(function(model) {
                            console.log('created error message');
                            callback(error, null);
                        });
 
                    });
           } else {
                console.log('Summary # of item', response.items.length);
              
                _.each(response.items, function(item){ 
                    console.log('summary name: ', item.name, item.id);
                    Bookshelf.model('AnalyticsAccountSummary')
                    .forge({
                        analytics_account_id: account.get('id'),
                        ga_id: item.id,
                    })
                    .fetch({require: true})
                    .then(function(model){
                        model.set({
                            is_valid: 1,
                            kind: item.kind,
                            name: item.name
                        }).save().then(function(model){
                            console.log('summary updated');
                        });
                    })
                    .catch(function (err) {
                        Bookshelf.model('AnalyticsAccountSummary')
                        .forge({
                            analytics_account_id: account.get('id'),
                            ga_id: item.id,
                            name: item.name,
                            is_valid: 1,
                            kind: item.kind,
                            error_message: ''
                        })
                        .save()
                        .then(function(model) {
                            console.log('summary created');
                        }); 
                    });
               });

               callback(null, 'ok');
            }
        });
    }
});
//module.exports.AnalyticsAccount = AnalyticsAccount;
module.exports = Bookshelf.model('AnalyticsAccount', AnalyticsAccount);

var AnalyticsAccountCollection = Bookshelf.Collection.extend({
    model: AnalyticsAccount,

    validate: function() {
        console.log('validate account collection');    
        this.forge()
        .query('where', 'is_valid', '=', '0')
        .fetch()
        .then(function (result) {
            result.each(function(account) {
                console.log('account: ', account.get('provider'));
                account.validate();                
          });
        })
        .catch(function (err) {
            console.log('error');
        });
    }
});
//module.exports.AnalyticsAccountCollection = AnalyticsAccountCollection; 
module.exports = Bookshelf.collection('AnalyticsAccountCollection', AnalyticsAccountCollection);

function validateAccessToken() {
    oauth2Client.setCredentials({
        access_token: account.get('access_token'),
        refresh_token: account.get('refresh_token')
    });
    analytics.management.accountSummaries.list({auth: oauth2Client}, function(err, response){
        if (err) {
            console.log('Encountered error', err);
            account.set('error_message', err.message);
            account.set('is_valid', -1);
            account.save();
        } else {
            console.log('Summary', response);
            account.set('is_valid', 1);
            account.save();
            var summary = account.analyticsAccountSummary();
            summary.add([
                {analytics_account_id: response.items[0].id}
            ]);
        }
    });
}

