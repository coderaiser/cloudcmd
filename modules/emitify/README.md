# Emitify

Dead simple event emitter.

## Install

```
npm i emitify --save
bower i emitify --save
```

## API

What you should do first is create new instance of `emitify` with 

```js
var emitify = Emitify();
```

Than you could just use API as it is.

### emitter.on(event, callback)

Add `callback` listener to `event`.

### emitter.off(event, callback)

Remove `callback` listener from `event`.

### emitter.emit(event [, data1, data2, ..., dataN])

Emit `event` with (or without) data.

### emitter.addListener(event, callback)

Alias to `emitter.on`.

### emitter.removeListener(event, callback)

Alias to `emitter.off`.

## How to use?

```js
var Emitify = require('emitify'),
    emitter = new Emitify(),
    log     = function(data) {
        console.log(data);
    });

emitter.on('data', log);

emitter.emit('data', 'hello');
// result
'hello'

emitter.off('data', log);

```

## License

MIT
