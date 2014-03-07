# structured-clone

Implements the [structured clone algorithm](https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/The_structured_clone_algorithm) to clone JSON types, RegExp, Buffers, and Dates. This module also supports serializing and deserializing an object from a buffer.

```
npm install structured-clone
```

* structured.**clone**(obj) &rarr; *Object*
* structured.**serialize**(obj) &rarr; *Buffer*
* structured.**deserialize**(buf) &rarr; *Object*