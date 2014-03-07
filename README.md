# structured-clone

Implements the [structured clone algorithm](https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/The_structured_clone_algorithm) to clone JSON types, RegExp, Buffers, and Dates. This module also supports serializing and deserializing an object from a buffer.

```
npm install structured-clone
```

```js
var clone = require('structured-clone');
```

* **clone**(obj) &rarr; *Object*
* clone.**serialize**(obj) &rarr; *Buffer*
* clone.**deserialize**(buf) &rarr; *Object*