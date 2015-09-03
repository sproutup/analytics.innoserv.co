'use strict';

var Bookshelf = require('../../../config/lib/bookshelf').bookshelf; 

var Content = Bookshelf.Model.extend({
    tableName: 'content',
    hasTimestamps: true
});

module.exports = Bookshelf.model('Content', Content);

var ContentCollection = Bookshelf.Collection.extend({
    model: Content
});

module.exports = Bookshelf.collection('ContentCollection', ContentCollection);

