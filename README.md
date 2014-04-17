# structured-clone

Implements the [structured clone algorithm](https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/The_structured_clone_algorithm). Clone JSON types, RegExp, Buffers, and Dates, returning a cloned object or a buffer that can be deserialized into a structured clone

```
npm install structured-clone
```

```js
var clone = require('structured-clone');
```

* **clone**(obj) &rarr; *Object*
* clone.**serialize**(obj) &rarr; *Buffer*
* clone.**deserialize**(buf) &rarr; *Object*

## Encoded format

The encoded format takes this form:

1. A UTF-8 encoded JSON string.
2. A null byte.
3. A binary blob that is the concatenation of all binary buffers in the original object. There are no delimiters in this buffer, indexes are represented in the JSON value (see below).

Dates, regexps, buffers, and cycles are encoded in a particular way to be decoded properly:

- Dates are encoded as the string '\x10d' followed by the JSON-stringified encoding of the date.
- Regexps are encoded as the string '\x10r{flags},{regexp source}'.
- Buffers are encoded as the string '\x10b{start},{length}'. All buffers in the encoded value are concatenated and placed in the binary blob. The start and length parameters indicate the indexes the slice of the buffer was encoded in.
- Lastly, string that begin with '\x10' are encoded as '\x10s{string}' to properly escape them.

**Optimizations:** If only a JSON value is being encoded (i.e. no Buffer values included), the null byte can be omitted, thus making the encoded format equivalent to a JSON-encoded string. If only a buffer is being encoded, it is equivalent to a null byte followed by the buffer (i.e. the JSON string is 0-length).

## License

MIT