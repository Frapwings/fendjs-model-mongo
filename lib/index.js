/**
 * Module(s)
 */

var Fetcher = require('./fetcher').Fetcher;
var Db = require('mongodb').Db;
var Server = require('mongodb').Server;

/**
 * Export(s)
 */

module.exports = Mongorable;


var db;

/**
 * Extend mongorable model plugin constructor.
 *
 * @return {Function}
 * @api public
 */
function Mongorable () {
  return function (Model) {
    // static
    Model._base = Model.modelName.toLowerCase() + 's';
    Model.fetcher = new Fetcher(db);
  };
}

/**
 * Bind connection
 *
 * @return {Object}
 * @api private
 */
function bindConnection () { return db; }

/**
 * Connect mongodb.
 *
 * @param {Object} options
 * @param {Function} fn
 * @return {Mongorable}
 * @api public
 */
Mongorable.connect = function (options, fn) {
  if (db) { 
    fn(new Error('already connected'));
    return this;
  }

  options = options || {};
  options.database = options.database || '';
  options.host = options.host || 'localhost';
  options.port = options.port || 27017;
  options.w = options.w || 0;

  db = new Db(
    options.database,
    new Server(options.host, options.port), {
    native_parser: true, safe: { w: options.w }
  });
  db.open(function (err, db) {
    return err ? fn(err) : fn();
  });

  return this;
};

/**
 * Disconnect mongodb.
 *
 * @param {Function} fn
 * @return {Mongorable}
 * @api public
 */
Mongorable.disconnect = function (fn) {
  // TODO: should think error message !!
  if (!db) {
    fn(new Error('not connected'));
    return this;
  }

  db.close(function (err) {
    if (err) return fn(err);
    db = null;
    fn();
  });

  return this;
};
