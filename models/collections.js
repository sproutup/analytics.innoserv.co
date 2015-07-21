"use strict";

var Model = require("./index.js");

var Users = Model.Bookshelf.Collection.extend({
	model: Model.User
});
exports.UserCollection = Users;

var AnalyticsAccountSummary = Model.Bookshelf.Collection.extend({
	model: Model.AnalyticsAccountSummary
});
exports.AnalyticsAccountSummaryCollection = AnalyticsAccountSummary;

var Tags = Model.Bookshelf.Collection.extend({
	model: Model.Tag
});
exports.TagsCollection = Tags;
