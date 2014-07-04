var test = require('tape');

test('deep cloning test', function (t) {
  t.plan(12)

  var clone = require('../')

  var a = { }
  a.b = a
  a.c = { $ref: '$' }
  a.d = new Buffer([0xde, 0xad])
  a.e = [ a, a.b ]
  a.f = new Date()
  a.g = /ab+a/i

  var a = clone(a);

  t.ok(a.b == a);
  t.ok(a.c.$ref == '$')
  t.ok(Buffer.isBuffer(a.d))
  t.ok(a.d[0] == 0xde)
  t.ok(a.d[1] == 0xad)
  t.ok(a.d.length == 2);
  t.ok(Array.isArray(a.e));
  t.ok(a.e.length == 2);
  t.ok(a.e[0] == a);
  t.ok(a.e[1] == a.b);
  t.ok(a.f instanceof Date);
  t.ok(a.g instanceof RegExp);
})

test('serializing test', function (t) {
  t.plan(14)

  var clone = require('../')

  var a = { }
  a.b = a
  a.c = { $ref: '$' }
  a.d = new Buffer([0xde, 0xad])
  a.e = [ a, a.b ]
  a.f = new Date()
  a.g = /ab+a/i

  var buf = clone.serialize(a);
  t.ok(buf.length, 'Buffer has length')
  t.ok(Buffer.isBuffer(buf), 'Buffer has length')

  var a = clone.deserialize(buf);

  t.ok(a.b == a);
  t.ok(a.c.$ref == '$')
  t.ok(Buffer.isBuffer(a.d))
  t.ok(a.d[0] == 0xde)
  t.ok(a.d[1] == 0xad)
  t.ok(a.d.length == 2);
  t.ok(Array.isArray(a.e));
  t.ok(a.e.length == 2);
  t.ok(a.e[0] == a);
  t.ok(a.e[1] == a.b);
  t.ok(a.f instanceof Date);
  t.ok(a.g instanceof RegExp);
})

test('deep copy root object', function (t) {
  t.plan(3);

  var clone = require('../');

  var buf = clone(new Buffer([0xca, 0xfe, 0xba, 0xbe]));
  t.ok(Buffer.isBuffer(buf));
  t.ok(buf.length == 4);
  t.ok(buf.readUInt32BE(0) == 0xcafebabe);
});

test('serializing root object', function (t) {
  t.plan(3);

  var clone = require('../');

  var buf = clone.deserialize(clone.serialize(new Buffer([0xca, 0xfe, 0xba, 0xbe])));
  t.ok(Buffer.isBuffer(buf));
  t.ok(buf.length == 4);
  t.ok(buf.readUInt32BE(0) == 0xcafebabe);
});


test('errors', function (t) {
  t.plan(4);

  var clone = require('../');

  var err = clone(new Error('boo!'));
  t.ok(err instanceof Error);
  t.ok(err.message == 'boo!');

  var err = clone.deserialize(clone.serialize(new Error('boo!')));
  t.ok(err instanceof Error);
  t.ok(err.message == 'boo!');
});

test('arrays of buffers', function(t) {
  t.plan(5);

  var b1 = new Buffer([0, 1, 2, 3, 4, 5]);
  var b2 = new Buffer([6, 7, 8, 9, 10, 11]);
  var arr = [b1, b2];

  var clone = require('../');

  var buf = clone.deserialize(clone.serialize(arr));

  t.ok(buf.length === arr.length);
  t.ok(buf[0].length === arr[0].length);
  t.ok(buf[1].length === arr[0].length);

  function bufferEqual (a, b) {
    for (var i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

  t.ok(bufferEqual(buf[0], arr[0]));
  t.ok(bufferEqual(buf[1], arr[1]));

})