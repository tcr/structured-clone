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