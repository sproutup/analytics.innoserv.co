var moment = require('moment');
var _ = require('underscore');
var google = require('googleapis');
var analytics = google.analytics('v3');
var youtube = google.youtube('v3');
var youtubeAnalytics = google.youtubeAnalytics('v1');
require('./analyticsAccountSummary');

var AnalyticsAccount = Bookshelf.Model.extend({
    tableName: "analytics_account",
    hasTimestamps: true,

    analyticsAccountSummary: function() {
        // one-to-many         
        this.hasMany('AnalyticsAccountSummary');
    },

    validate: function() {
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
                    return;
                }
               
                console.log("tokens", tokens);
                account.set('access_token', tokens.access_token);
                account.set('updated_at', moment().toDate());
                account.set('expires_at', moment(tokens.expiry_date).toDate());
                account.set('is_valid', 1);
                account.set('error_message', '');
                account.save();
            });
        }
        else{
            console.log("access token still valid");
//            account.updateAccountSummary();
//            account.updateYoutubeGroups();
        }
    },

    updateYoutubeGroups: function() {
        var model = this;
        console.log('get yt-analytics');
//        youtubeAnalytics.reports.query({auth: oauth2Client}, function(err, data){
//            console.log('hello', err);
//        })
        youtube.channels.list({auth: oauth2Client, part: 'id,snippet,statistics', mine: 'true'}, function(err, data){
            if (err) {
                console.log('error: ', err.message);
                //model.set('error_message', err.message);
                //model.set('youtube_analytics_api', -1);
                //model.save();
                return;
            } 
            console.log('Youtube channels', data); 
            _.each(data.items, function(item){
                console.log('title: ', item.title);
                var summary = Bookshelf.model('AnalyticsAccountSummary')
                .forge({
                    analytics_account_id: model.get('id'),
                    ga_id: item.id,
                })
                .fetch()
                .then(function(existing) {
                    console.log('summary found', existing.id);
                    existing.set({
                        kind: item.kind,
                        name: item.snippet.title,
                        viewCount: item.statistics.viewCount,
                        followerCount: item.statistics.subscriberCount
                    })
                    .save().then(function(){
                        console.log('updated...');
                    });
                })
                .catch(function(err){
                    console.log('error: ', err);
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
        })
    },

    updateAccountSummary: function() {
        var account = this;
        analytics.management.accountSummaries.list({auth: oauth2Client}, function(err, response){
            if (err) {
                console.log('Encountered error', err);
                account.set('error_message', err.message);
                account.set('is_valid', -1);
                account.save();
            } else {
                console.log('Summary', response);
                account.set('is_valid', 1);
                account.set('username', response.username);
                account.save();
               
                _.each(response.items, function(item){ 
                     var summary = Bookshelf.model('AnalyticsAccountSummary')
                    .forge({
                        analytics_account_id: account.get('id'),
                        ga_id: item.id,
                        kind: item.kind,
                        name: item.name
                    })
                    .save().then(function(model) {
                        console.log('summary item saved');
                    });
                })
            }
        })
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
                console.log("account: ", account.get('provider'));
                account.validate();                
          })
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
            ])
        }
    })
}

