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

	console.log('hi')
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