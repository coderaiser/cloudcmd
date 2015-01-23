Zipio
=====

Zip data

## Install

```
npm install zipio --save
bower install zipio --save
```

## Use

```js
var zipio = require('zipio');

zipio('hello world', function(error, data) {
    if (error)
        console.log(error.message);
    else
        console.log(data):
});

```
## License

MIT
