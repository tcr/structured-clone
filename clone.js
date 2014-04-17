// Implement the clone algorithm directly.
// https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/The_structured_clone_algorithm

function clone (oToBeCloned, cloned, clonedpairs)
{
  cloned = cloned || [];
  clonedpairs = clonedpairs || [];

  if (cloned.indexOf(oToBeCloned) > -1) {
    return clonedpairs[cloned.indexOf(oToBeCloned)];
  }

  if (oToBeCloned === null || !(oToBeCloned instanceof Object)) { return oToBeCloned; }
  var oClone, fConstr = oToBeCloned.constructor;
  switch (fConstr) {
    case RegExp:
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
        for (var sProp in oToBeCloned) { oClone[sProp] = clone(oToBeCloned[sProp], cloned, clonedpairs); }
      }
  }
  return oClone;
}

exports.clone = clone;