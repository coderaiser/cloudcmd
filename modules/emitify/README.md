# Emitify [![License][LicenseIMGURL]][LicenseURL] [![NPM version][NPMIMGURL]][NPMURL] [![Dependency Status][DependencyStatusIMGURL]][DependencyStatusURL] [![Build Status][BuildStatusIMGURL]][BuildStatusURL]

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

emitter.off('data', log);

```

## License

MIT

[NPMIMGURL]:                https://img.shields.io/npm/v/emitify.svg?style=flat
[BuildStatusIMGURL]:        https://img.shields.io/travis/coderaiser/emitify/master.svg?style=flat
[DependencyStatusIMGURL]:   https://img.shields.io/gemnasium/coderaiser/emitify.svg?style=flat
[LicenseIMGURL]:            https://img.shields.io/badge/license-MIT-317BF9.svg?style=flat
[NPMURL]:                   https://npmjs.org/package/emitify "npm"
[BuildStatusURL]:           https://travis-ci.org/coderaiser/emitify  "Build Status"
[DependencyStatusURL]:      https://gemnasium.com/coderaiser/emitify "Dependency Status"
[LicenseURL]:               https://tldrlegal.com/license/mit-license "MIT License"

