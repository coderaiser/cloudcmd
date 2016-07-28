# Jonny

Work with json without exeptions.

## Install

```
npm i jonny --save
```

## How to use?

```js
var jonny   = require('jonny'),
    obj     = jonny.parse('{ "hello": "world" }');
    
    console.log(jonny.stringify(obj, 0, 4));
    // results
    // "{
    // "hello": "world"
    // }"
```

## License

MIT
