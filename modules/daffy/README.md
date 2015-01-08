# Daffy

Create and apply patches.

## Install

```
npm i daffy --save
```

## How to use?

```js
var daffy   = require('daffy'),
    patch   = daffy.createPatch('hello', 'hello world');

daffy.applyPatch('hello', patch);
```

## License

MIT
