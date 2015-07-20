"use strict";

//var moment = require("moment");

var Knex = require("knex")({
    client: "mysql",
    connection: {
        host: "localhost",
        user: "root",
        password: "root",
        database: "sproutup_db"
    }
});

var Bookshelf = require("bookshelf")(Knex);
Bookshelf.plugin("visibility");

var User = Bookshelf.Model.extend({
	tableName: "users",
//	blogpost: function() {
//		// one-to-many
//		this.hasMany(Blogpost, "blogpost_id");
//	}
});
exports.User = User;

var AnalyticsAccount = Bookshelf.Model.extend({
	tableName: "analytics_account",
	analyticsAccountSummary: function() {
		// one-to-many
		this.hasMany(AnalyticsAccountSummary, "id");
	}
});
exports.AnalyticsAccount = AnalyticsAccount;

var AnalyticsAccountSummary = Bookshelf.Model.extend({
	tableName: "analytics_account_summary",
	analyticsAccount: function() {
		// one-to-one or many-to-one
		return this.belongsTo(AnalyticsAccount, "analytics_account_id");
	}
});
exports.AnalyticsAccountSummary = AnalyticsAccountSummary;

exports.Bookshelf = Bookshelf;
