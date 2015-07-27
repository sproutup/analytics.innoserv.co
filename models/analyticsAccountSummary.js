var moment = require('moment');
var google = require('googleapis');
var analytics = google.analytics('v3');

var AnalyticsAccountSummary = Bookshelf.Model.extend({
    tableName: "analytics_account_summary",
    hasTimestamps: true,
//    analyticsAccount: function() {
//        // one-to-many         
//        this.belongsTo(AnalyticsAccount, "analytics_account_id");
//    },

    createOrUpdate: function(callback){
        return callback(null);
    }
});


//module.exports.AnalyticsAccountSummary = AnalyticsAccountSummary;
module.exports = Bookshelf.model('AnalyticsAccountSummary', AnalyticsAccountSummary);

var AnalyticsAccountSummaryCollection = Bookshelf.Collection.extend({
    model: AnalyticsAccountSummary
});
module.exports.AnalyticsAccountSummaryCollection = AnalyticsAccountSummaryCollection; 

