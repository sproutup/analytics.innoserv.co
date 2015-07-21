"use strict";

//var moment = require("moment");

var User = Bookshelf.Model.extend({
	tableName: "users",
//	blogpost: function() {
//		// one-to-many
//		this.hasMany(Blogpost, "blogpost_id");
//	}
});
exports.User = User;

var analyticsAccount = require("./analyticsAccount.js");

var AnalyticsAccountSummary = Bookshelf.Model.extend({
	tableName: "analytics_account_summary",
	analyticsAccount: function() {
		// one-to-one or many-to-one
		return this.belongsTo(AnalyticsAccount, "analytics_account_id");
	}
});
exports.AnalyticsAccountSummary = AnalyticsAccountSummary;

exports.Bookshelf = Bookshelf;
