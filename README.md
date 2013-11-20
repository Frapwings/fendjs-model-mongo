# fendjs-model-mongo

[![Build Status](https://travis-ci.org/Frapwings/fendjs-model-mongo.png?branch=master)](https://travis-ci.org/Frapwings/fendjs-model-mongo) [![Coverage Status](https://coveralls.io/repos/Frapwings/fendjs-model-mongo/badge.png)](https://coveralls.io/r/Frapwings/fendjs-model-mongo) [![NPM version](https://badge.fury.io/js/fendjs-model-mongo.png)](http://badge.fury.io/js/fendjs-model-mongo) [![Dependency Status](https://david-dm.org/Frapwings/fendjs-model-mongo.png)](https://david-dm.org/Frapwings/fendjs-model-mongo)

MongoDB model plugin for Fend.js

# Usage

```js
var Modeler = require('fendjs-model');
var Mongorable = require('fendjs-model-mongo');

Modeler.use(Mongorable('mongodb://localhost/test'));

var Pet = Modeler('Pet')
  .attr('id')
  .attr('name');

var pet = new Pet({ name: 'Tobi', species: 'Ferret' });
pet.save(function (err, res) {
  if (err) {
    // Error something todo ...
    return;
  }
  // Something todo ...
});
```

# API

TODO:

# Testing

```
$ npm install
$ make test
```

# License

[MIT license](http://www.opensource.org/licenses/mit-license.php).

See the `LICENSE`.

[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/Frapwings/fendjs-model-mongo/trend.png)](https://bitdeli.com/free "Bitdeli Badge")
