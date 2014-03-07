var cycle = require('./cycle');
var multibuffer = require('multibuffer')
var regexpClone = require('./regexp-clone');



function serialize (obj) {
	var map = cycle.decycle(obj)
	return multibuffer.pack([
		new Buffer(JSON.stringify(map.json)),
		multibuffer.pack(map.buffers),
		multibuffer.pack(map.dates.map(function (date) {
			return new Buffer(date.toISOString());
		})),
		multibuffer.pack(map.regexps.map(function (regex) {
			return new Buffer(JSON.stringify(regexpClone(regex)));
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
function clone (oToBeCloned) {
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
    case Buffer:
      oClone = new Buffer(oToBeCloned.length);
      oToBeCloned.copy(oClone);
      break;
    // etc.
    default:
      oClone = new fConstr();
  }
  for (var sProp in oToBeCloned) { oClone[sProp] = clone(oToBeCloned[sProp]); }
  return oClone;
}

exports.clone = clone;
exports.serialize = serialize;
exports.deserialize = deserialize;