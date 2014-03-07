var a = { }
a.b = a
a.c = { $ref: '$' }
a.d = new Buffer([0xde, 0xad])
a.e = [ a, a.b ]
a.f = new Date()
a.g = /ab+a/i

console.log('-->', serialize(a));
console.log('--result->', deserialize(serialize(a)));