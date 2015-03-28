# Format

Library for format size, permissions, etc.

# How to use?

Format could be used in browser or node.

In browser:

```js
<script src='lib/format.js'></script>
```

In node:

```js
var Format = require('format-io');
```

# API

## size

```js
    var size    = 1024 * 1024 * 5,
        sizeStr = Format.size(size);
        //'5.00mb'
```

## permissions.symbolic

```js
    var perm    = '00777',
        permStr = Format.permissions.symbolic(perm);
        //'rwx rwx rwx
```

## permissions.numeric

```js
    var perm    = 'rwx rwx rwx',
        permNum = Format.permissions.numeric(perm);
        //'00777'
```

# License

MIT
