/*
 * Event data model
 */

var app = require('../app.js');

var EventFact = app.get('bookshelf').Model.extend({
    tableName: 'event_fact'
//    date: function() {
//        return this.hasOne(DateDim);
//    }
});

module.exports = EventFact;
