/**
 * Module(s)
 */

var debug = require('debug')('fendjs-model-mongo:fetcher');
var Collection = require('fendjs-collection');
var async = require('async');
var noop = function () {};

/**
 * Export(s)
 */
exports.Fetcher = Fetcher;


/**
 * MongoDB Fetcher
 */

function Fetcher (db) {
  this._db = db;
}

Fetcher.prototype.save = function (model, fn) {
  fn = fn || noop;

  if (!model.isValid()) {
    return fn(new Error('validation failed'));
  }
  
  model.Model.emit('saving', model);
  model.emit('saving');

  // TODO: should check db opened
  var db = this._db;

  // TODO: should set options
  var options = {};

  async.waterfall([
    function (next) { db.collection(model.Model._base, next); },
    function (collection, next) { collection.save(model.toJSON(), options, next); }
  ], function (err, result) {
    debug('save', err, result);
    if (err) return fn(err);
    model.primary(result._id);
    model.dirty = {};
    model.Model.emit('save', model, result);
    model.emit('save', result);
    fn(null, result);
  });
};

Fetcher.prototype.update = function (model, fn) {
  fn = fn || noop;

  if (!model.isValid()) {
    return fn(new Error('validation failed'));
  }

  model.Model.emit('saving', model);
  model.emit('saving');

  // TODO: should check db opened
  var db = this._db;
  
  // TODO: should set options
  var options = { new: true };

  async.waterfall([
    function (next) { db.collection(model.Model._base, next); },
    function (collection, next) {
      collection.findAndModify({
        _id: model.primary()
      }, [], { $set: model.dirty }, options, next);
    }
  ], function (err, result) {
    debug('update', err, result);
    if (err) return fn(err);
    model.dirty = {};
    model.Model.emit('save', model, result);
    model.emit('save');
    fn(null, result);
  });
};

Fetcher.prototype.destroy = function (model, fn) {
  model.Model.emit('destroying', model);
  model.emit('destroying');

  // TODO: should check db opened
  var db = this._db;
  
  // TODO: should set options
  var options = { new: true };

  async.waterfall([
    function (next) { db.collection(model.Model._base, next); },
    function (collection, next) {
      collection.findAndRemove({
        _id: model.primary()
      }, [], options, next);
    }
  ], function (err, result) {
    debug('destroy', err, result);
    if (err) return fn(err);
    model.destroyed = true;
    model.Model.emit('destroy', model, result);
    model.emit('destroy', result);
    fn(null, result);
  });
};

Fetcher.prototype.destroyAll = function (Model, fn) {
  // TODO: should check db opened
  var db = this._db;

  // TODO: should set options
  var options = {};

  async.waterfall([
    function (next) { db.collection(Model._base, next); },
    function (collection, next) { collection.remove({}, options, next); }
  ], function (err, result) {
    debug('destroyAll', err, result);
    if (err) return fn(err, result);
    fn(null, result);
  });
};

Fetcher.prototype.all = function (Model, fn) {
  // TODO: should check db opened
  var db = this._db;

  // TODO: should set options
  var options = {};

  async.waterfall([
    function (next) { db.collection(Model._base, next); },
    function (collection, next) { collection.find({}, options, next); }
  ], function (err, result) {
    debug('all', err, result);
    if (err) return fn(err, result);
    result.toArray(function (err, recs) {
      var col = new Collection;
      recs.forEach(function (rec) {
        col.push(new Model(rec));
      });
      fn(null, col, recs);
    });
  });
};

Fetcher.prototype.get = function (Model, id, fn) {
  // TODO: should check db opened
  var db = this._db;

  // TODO: should set options
  var options = {};

  async.waterfall([
    function (next) { db.collection(Model._base, next); },
    function (collection, next) { collection.findOne({ _id: id }, options, next); }
  ], function (err, result) {
    debug('get', err, result);
    if (err) return fn(err, null, result);
    if (!result) return fn(new Error('not found'), null, result);
    fn(null, new Model(result), result);
  });
};
