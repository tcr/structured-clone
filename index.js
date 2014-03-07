var cycle = require('./cycle');
var multibuffer = require('multibuffer')



function serialize (obj) {
	var map = cycle.decycle(obj)
	return multibuffer.pack([
		new Buffer(JSON.stringify(map.json)),
		multibuffer.pack(map.buffers),
		multibuffer.pack(map.dates.map(function (date) {
			return new Buffer(date.toISOString());
		})),
		multibuffer.pack(map.regexps.map(function (regexp) {
      var flags = [];
      if (regexp.global) flags.push('g');
      if (regexp.multiline) flags.push('m');
      if (regexp.ignoreCase) flags.push('i');
			return new Buffer(JSON.stringify([regexp.source, flags.join('')]));
		}))
	]);
}

function deserialize (buf) {
	var map = multibuffer.unpack(buf)
	var result = {
		json: JSON.parse(map[0].toString()),
		buffers: multibuffer.unpack(map[1]),
		dates: multibuffer.unpack(map[2]).map(function (buf) {
			return new Date(buf.toString());
		}),
		regexps: multibuffer.unpack(map[3]).map(function (buf) {
			var json = JSON.parse(buf.toString());
			return new RegExp(json[0], json[1]);
		})
	};
	return cycle.retrocycle(result);
}

// https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/The_structured_clone_algorithm
function clone (oToBeCloned, cloned, clonedpairs) {
  cloned = cloned || [];
  clonedpairs = clonedpairs || [];

  if (cloned.indexOf(oToBeCloned) > -1) {
    return clonedpairs[cloned.indexOf(oToBeCloned)];
  }

  if (oToBeCloned === null || !(oToBeCloned instanceof Object)) { return oToBeCloned; }
  var oClone, fConstr = oToBeCloned.constructor;
  switch (fConstr) {
    // implement other special objects here!
    case RegExp:
      /*
      oClone = new fConstr(oToBeCloned.source, Array.prototype.filter.call("gim", function () {
        return (oToBeCloned.global | oToBeCloned.ignoreCase << 1 | oToBeCloned.multiline) & 1 << arguments[1];
      }).join(""));
      */
      oClone = new fConstr(oToBeCloned.source, "g".substr(0, Number(oToBeCloned.global)) + "i".substr(0, Number(oToBeCloned.ignoreCase)) + "m".substr(0, Number(oToBeCloned.multiline)));
      break;
    case Date:
      oClone = new fConstr(oToBeCloned.getTime());
      break;
    // etc.
    default:
      if (Buffer.isBuffer(oToBeCloned)) {
        oClone = new Buffer(oToBeCloned.length);
        oToBeCloned.copy(oClone);
      } else {
        oClone = new fConstr();
        cloned.push(oToBeCloned); clonedpairs.push(oClone); 
      }
  }
  for (var sProp in oToBeCloned) { oClone[sProp] = clone(oToBeCloned[sProp], cloned, clonedpairs); }
  return oClone;
}

module.exports = clone;
module.exports.clone = clone;
module.exports.serialize = serialize;
module.exports.deserialize = deserialize;