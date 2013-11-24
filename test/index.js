'use strict';

/**
 * Module(s)
 */

var expect = require('expect.js');
var Modeler = require('fendjs-model');
var Mongorable = require(process.env.FENDJS_MODEL_MONGO_COV ? '../lib-cov/' : '../');

/**
 * Test(s)
 */

describe('fendjs-model-mongo', function () {
  describe('Mongorable.connect(fn) and Mongorable.disconnec(fn)', function () {
    describe('when do not connect yet', function () {
      describe('Mongorable.disconnect(fn)', function () {
        it('should be an error', function (done) {
          Mongorable.disconnect(function (err) {
            expect(err).to.be.an(Error);
            done();
          });
        });
      });

      describe('Mongorable.connect(fn)', function () {
        it('should connect', function (done) {
          Mongorable.connect({ database: 'test' }, function (err) { done(err); });
        });

        describe('when become connected', function () {
          describe('Mongorable.connect(fn)', function () {
            it('should be an error', function (done) {
              Mongorable.connect({ database: 'test' }, function (err) {
                expect(err).to.be.an(Error);
                done();
              });
            });
          });

          describe('Mongorable.disconnect(fn)', function () {
            it('should disconnect', function (done) {
              Mongorable.disconnect(function (err) { done(err); });
            });

            describe('when become not connected', function () {
              describe('Mongorable.disconnect(fn)', function () {
                it('should be an error', function (done) {
                  Mongorable.disconnect(function (err) {
                    expect(err).to.be.an(Error);
                    done();
                  });
                });
              });
            });
          });
        });
      });
    });
  });


  var User;
  var required = function (attr) {
    return function (Model) {
      Model.validate(function (model) {
        if (!model.has(attr)) model.error(attr, 'field required');
      });
    }
  };

  describe('Mongorable()', function () {
    before(function (done) {
      Modeler.use(Mongorable());
      Mongorable.connect({ database: 'test' }, function (err) { done(err); });
    });

    after(function (done) {
      Mongorable.disconnect(function (err) { done(err); });
    });

    describe('define "User" model', function () {
      before(function (done) {
        User = Modeler('User')
          .attr('_id')
          .attr('name')
          .attr('age')
          .use(required('name'));
        done();
      });

      describe('Model#save([fn])', function(){
        describe('when new', function () {
          describe('and valid', function () {
            it('should save', function (done) {
              var user = new User({ name: 'foo', age: 34 });
              user.save(function (err, res) {
                expect(user._id()).to.be.ok();
                expect(user.isNew()).to.eql(false);
                expect(err).not.to.be.ok();
                expect(res._id).to.eql(user._id());
                done();
              });
            });

            it('should emit "saving"', function (done) {
              var user = new User({ name: 'foo', age: 34 });
              user.on('saving', function () {
                expect(user._id()).not.to.be.ok();
                expect(user.isNew()).to.eql(true);
                done();
              });
              user.save();
            });

            it('should emit "saving" on the constructor', function (done) {
              var user = new User({ name: 'foo', age: 34 });
              User.once('saving', function (obj) {
                expect(obj._id()).not.to.be.ok();
                expect(obj.isNew()).to.eql(true);
                expect(user).to.eql(obj);
                done();
              });
              user.save();
            });

            it('should emit "save"', function (done) {
              var user = new User({ name: 'foo', age: 34 });
              user.on('save', function (res) {
                expect(user._id()).to.be.ok();
                expect(user.isNew()).to.eql(false);
                expect(res._id).to.eql(user._id());
                done();
              });
              user.save();
            });

            it('should emit "save" on the constructor', function (done) {
              var user = new User({ name: 'foo', age: 34 });
              User.once('save', function (obj, res) {
                expect(obj._id()).to.be.ok();
                expect(obj.isNew()).to.eql(false);
                expect(user).to.eql(obj);
                expect(obj._id()).to.eql(res._id);
                done();
              });
              user.save();
            });
          });

          describe('and invalid', function () {
            it('should error', function (done) {
              var user = new User;
              user.save(function (err, res) {
                expect(err.message).to.eql('validation failed');
                expect(res).not.to.be.ok();
                expect(user.errors.length).to.eql(1);
                expect(user.errors[0].attr).to.eql('name');
                expect(user._id()).not.to.be.ok();
                expect(user.isNew()).to.eql(true);
                done();
              });
            });
          });
        });

        describe('when old', function () {
          describe('and valid', function () {
            it('should save', function (done) {
              var user = new User({ name: 'foo', age: 34 });
              user.save(function (err, res) {
                expect(err).not.to.be.ok();
                expect(res._id).to.eql(user._id());
                var id = user._id();
                user.name('bar');
                user.save(function (err, res) {
                  expect(err).not.to.be.ok();
                  expect(res._id).to.eql(user._id());
                  expect(user._id()).to.eql(id);
                  User.get(id, function (err, model, res) {
                    expect(err).not.to.be.ok();
                    expect(model._id()).to.eql(id);
                    expect(model.name()).to.eql('bar');
                    expect(res._id).to.eql(model._id());
                    done();
                  });
                });
              });
            });

            it('should emit "saving"', function (done) {
              var user = new User({ name: 'foo', age: 34 });
              user.save(function (err, res) {
                expect(err).not.to.be.ok();
                expect(res._id).to.eql(user._id());
                user.on('saving', done);
                user.save();
              });
            });

            it('should emit "saving" on the constructor', function (done) {
              var user = new User({ name: 'foo', age: 34 });
              user.save(function (err, res) {
                expect(err).not.to.be.ok();
                expect(res._id).to.eql(user._id());
                User.once('saving', function (obj) {
                  expect(obj).to.eql(user);
                  done();
                });
                user.save();
              });
            });

            it('should emit "save"', function (done) {
              var user = new User({ name: 'foo', age: 34 });
              user.save(function (err, res) {
                expect(err).not.to.be.ok();
                expect(res._id).to.eql(user._id());
                user.on('save', done);
                user.save();
              });
            });

            it('should emit "save" on the constructor', function (done) {
              var user = new User({ name: 'foo', age: 34 });
              user.save(function (err, res) {
                expect(err).not.to.be.ok();
                expect(res._id).to.eql(user._id());
                User.once('save', function (obj) {
                  expect(obj).to.eql(user);
                  done();
                });
                user.save();
              });
            });
          });

          describe('and invalid', function () {
            it('should error', function (done) {
              var user = new User({ name: 'foo' });
              user.save(function (err, res) {
                expect(err).not.to.be.ok();
                expect(res._id).to.eql(user._id());
                user.name(null);
                user.save(function (err, res) {
                  expect(err.message).to.eql('validation failed');
                  expect(user.errors.length).to.eql(1);
                  expect(user.errors[0].attr).to.eql('name');
                  done();
                });
              });
            });
          });
        });
      });


      describe('Model#destroy([fn])', function () {
        describe('when new', function () {
          it('should error', function (done) {
            var user = new User;
            user.destroy(function (err, res) {
              expect(err.message).to.eql('not saved');
              expect(res).not.to.be.ok();
              done();
            });
          })
        })

        describe('when old', function () {
          it('should destroy', function (done) {
            var user = new User({ name: 'foo', age: 34 });
            user.save(function (err, res) {
              expect(err).not.to.be.ok();
              expect(res._id).to.eql(user._id());
              user.destroy(function (err, res) {
                expect(err).not.to.be.ok();
                expect(user.destroyed).to.eql(true);
                expect(res._id).to.eql(user._id());
                done();
              });
            });
          })

          it('should emit "destroying"', function (done) {
            var user = new User({ name: 'foo', age: 34 });
            user.save(function (err, res) {
              expect(err).not.to.be.ok();
              expect(res._id).to.eql(user._id());
              user.on('destroying', function () {
                done();
              });
              user.destroy();
            });
          })

          it('should emit "destroying" on the constructor', function (done) {
            var user = new User({ name: 'foo', age: 34 });
            user.save(function (err, res) {
              expect(err).not.to.be.ok();
              expect(res._id).to.eql(user._id());
              User.once('destroying', function (obj) {
                expect(obj).to.eql(user);
                done();
              });
              user.destroy();
            });
          })

          it('should emit "destroy"', function (done) {
            var user = new User({ name: 'foo', age: 34 });
            user.save(function (err, res) {
              expect(err).not.to.be.ok();
              expect(res._id).to.eql(user._id());
              user.on('destroy', function (res) {
                expect(res._id).to.eql(user._id());
                expect(user.destroyed).to.eql(true);
                done();
              });
              user.destroy();
            });
          })

          it('should emit "destroy" on the constructor', function (done) {
            var user = new User({ name: 'foo', age: 34 });
            user.save(function (err, res) {
              expect(err).not.to.be.ok();
              expect(res._id).to.eql(user._id());
              User.once('destroy', function (obj, res) {
                expect(obj.destroyed).to.eql(true);
                expect(obj).to.eql(user);
                expect(res._id).to.eql(obj._id());
                done();
              });
              user.destroy();
            });
          });
        });
      });


      describe('Model.get(id, fn)', function () {
        it('should error', function (done) {
          User.get('foo', function (err, model, res) {
            expect(err.message).to.eql('not found');
            expect(model).not.to.be.ok();
            expect(res).not.to.be.ok();
            done();
          });
        });

        it('should get a model', function (done) {
          var user = new User({ name: 'foo', age: 34 });
          user.save(function (err, res) {
            User.get(user._id(), function (err, model, res) {
              expect(err).not.to.be.ok();
              expect(model._id()).to.eql(user._id());
              expect(model.name()).to.eql(user.name());
              expect(res._id).to.eql(model._id());
              done();
            });
          });
        });
      });


      describe('Model.destroyAll(fn)', function () {
        it('should destroyAll', function (done) {
          User.destroyAll(function (err, res) {
            expect(err).not.to.be.ok();
            expect(res).not.to.be.ok();
            done();
          });
        });
      });


      describe('Model.all(fn)', function(){
        var user1, user2, user3;
        before(function (done){
          user1 = new User({ name: 'foo', age: 2 });
          user2 = new User({ name: 'bar', age: 1 });
          user3 = new User({ name: 'buz', age: 8 });
          user1.save(function (err, res) {
            user2.save(function(err, res) {
              user3.save(done);
            });
          });
        })

        after(function(done){
          User.destroyAll(done);
        });

        it('should respond with a collection of all', function(done){
          User.all(function(err, users, res) {
            expect(err).not.to.be.ok();
            expect(res.length).to.eql(3);
            expect(users.at(0).name()).to.eql(user1.name());
            expect(users.at(1).name()).to.eql(user2.name());
            expect(users.at(2).name()).to.eql(user3.name());
            done();
          });
        })
      })
    });
  });
});
