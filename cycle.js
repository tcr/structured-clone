/*
    cycle.js
    2013-02-19

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.
*/

/*jslint evil: true, regexp: true */

/*members $ref, apply, call, decycle, hasOwnProperty, length, prototype, push,
    retrocycle, stringify, test, toString
*/

var multibuffer = require("multibuffer")

var cycle = exports;

function derez(value, path, objects, paths, buffers, dates, regexps) {

// The derez recurses through the object, producing the deep copy.

    var i,          // The loop counter
        name,       // Property name
        nu;         // The new object or array

// typeof null === 'object', so go on if this value is really an object but not
// one of the weird builtin objects.

    if (typeof value === 'object' && value !== null &&
            !(value instanceof Boolean) &&
            !(value instanceof Date)    &&
            !(value instanceof Number)  &&
            !(value instanceof RegExp)  &&
            !(value instanceof Buffer)  &&
            !(value instanceof String)) {

// If the value is an object or array, look to see if we have already
// encountered it. If so, return a $ref/path object. This is a hard way,
// linear search that will get slower as the number of unique objects grows.

        i = objects.indexOf(value);
        if (i !== -1) {
            return {$ref: paths[i]};
        }

// Otherwise, accumulate the unique value and its path.

        objects.push(value);
        paths.push(path);

// If it is an array, replicate the array.

        if (Array.isArray(value)) {
            nu = [];
            for (i = 0; i < value.length; i += 1) {
                nu[i] = derez(value[i], path + '[' + i + ']',
                	objects, paths, buffers, dates, regexps);
            }
        } else {

// If it is an object, replicate the object.

            nu = {};
            for (name in value) {
                if (Object.prototype.hasOwnProperty.call(value, name) && value != '__proto__') {
                	if (name == '$ref' && typeof value[name] == 'string') {
                		nu[name] = '!' + value[name]
                	} else {
	                    nu[name] = derez(value[name],
	                        path + '[' + JSON.stringify(name) + ']',
	                        objects, paths, buffers, dates, regexps);
	                }
                }
            }
        }
        return nu;
    } else if (value instanceof Buffer) {
    	return { $ref: '$$[' + (buffers.push(value) - 1) + ']' };
    } else if (value instanceof Date) {
    	return { $ref: '$$$[' + (dates.push(value) - 1) + ']' };
    } else if (value instanceof RegExp) {
    	return { $ref: '$$$$[' + (regexps.push(value) - 1) + ']' };
    }
    return value;
}

cycle.decycle = function decycle(object) {
    'use strict';

// Make a deep copy of an object or array, assuring that there is at most
// one instance of each object or array in the resulting structure. The
// duplicate references (which might be forming cycles) are replaced with
// an object of the form
//      {$ref: PATH}
// where the PATH is a JSONPath string that locates the first occurance.
// So,
//      var a = [];
//      a[0] = a;
//      return JSON.stringify(JSON.decycle(a));
// produces the string '[{"$ref":"$"}]'.

// JSONPath is used to locate the unique object. $ indicates the top level of
// the object or array. [NUMBER] or [STRING] indicates a child member or
// property.

    var objects = [],   // Keep a reference to each unique object or array
        paths = [],     // Keep the path to each unique object or array
        buffers = [],
        dates = [],
        regexps = [];   // Returned buffers

    return {
    	json: derez(object, '$',
    		objects, paths, buffers, dates, regexps),
    	buffers: buffers,
    	dates: dates,
    	regexps: regexps,
    }
};


function rerez($, $$, $$$, $$$$) {

// Restore an object that was reduced by decycle. Members whose values are
// objects of the form
//      {$ref: PATH}
// are replaced with references to the value found by the PATH. This will
// restore cycles. The object will be mutated.

// The eval function is used to locate the values described by a PATH. The
// root object is kept in a $ variable. A regular expression is used to
// assure that the PATH is extremely well formed. The regexp contains nested
// * quantifiers. That has been known to have extremely bad performance
// problems on some browsers for very long strings. A PATH is expected to be
// reasonably short. A PATH is allowed to belong to a very restricted subset of
// Goessner's JSONPath.

// So,
//      var s = '[{"$ref":"$"}]';
//      return JSON.retrocycle(JSON.parse(s));
// produces an array containing a single element which is the array itself.

    var px =
        /^\${1,4}(?:\[(?:\d+|\"(?:[^\\\"\u0000-\u001f]|\\([\\\"\/bfnrt]|u[0-9a-zA-Z]{4}))*\")\])*$/;

    function redo (item) {
        if (item && typeof item === 'object') {
            var path = item.$ref;
            if (typeof path === 'string' && px.test(path)) {
                return eval(path);
            } else {
                if (typeof path === 'string' && path[0] == '!') {
                    item.$ref = path.substr(1);
                }
                rez(item, $$, $$$, $$$$);
            }
        }
        return item;
    }

    function rez(value) {

// The rez function walks recursively through the object looking for $ref
// properties. When it finds one that has a value that is a path, then it
// replaces the $ref object with a reference to the value that is found by
// the path.

        var i, name;

        if (value && typeof value === 'object') {
            if (Array.isArray(value)) {
                for (i = 0; i < value.length; i += 1) {
                    value[i] = redo(value[i]);
                }
            } else {
                for (name in value) {
                	value[name] = redo(value[name]);
                }
            }
        }
    }

    $ = redo($)

    return $;
};

cycle.retrocycle = function retrocycle($) {
    'use strict';
    return rerez($.json, $.buffers, $.dates, $.regexps);
}