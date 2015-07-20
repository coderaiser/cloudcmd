# Philip

[Dom File System](https://developer.mozilla.org/en-US/docs/Web/API/FileSystem "Dom File System") processing library

## Install

```
bower i philip --save
```

## How to use?

Add `philip.js` [findit](https://github.com/coderaiser/domfs-findit "Find It"), [execon](https://github.com/coderaiser/execon "Patterns of function calls")(or [async](https://github.com/caolan/async "Async utilities for node and the browser" with `window.exec = window.async`) and [emitify](https://github.com/coderaiser/emitify "Emitify").

Or any other node-compitable [EventEmitter](https://iojs.org/api/events.html "Events") (set `window.Emitify = your_emitter` before using `findit`).

```html
<script src="modules/emitify/lib/emitify.js"></script>
<script src="modules/findit/lib/findit.js"></script>
<script src="lib/philip.js"></script>
```

```js
(function() {
    'use strict';
    
    var node = window;
    
    node.addEventListener('drop', function (e) {
        var upload,
            entry,
            finder,
            item = e.dataTransfer.items[0];
        
        e.preventDefault();
        
        entry   = item.webkitGetAsEntry();
        
        upload = philip(entry, function(type, name, data/*, i, n,*/, callback) {
            var error = null;
            
            switch(type) {
            case 'file':
                console.log('file', name, data);
                break;
            
            case 'directory':
                console.log('directory', name);
                break;
            }
            
            callback(error);
        });
        
        upload.on('error', function(error) {
            upload.abort();
            console.error(error);
        });
        
        upload.on('progress', function(count) {
            console.log(count);
        });
        
        upload.on('end', function() {
            console.log('done');
        });
    });
        
    node.addEventListener('dragover', function (e) {
        e.preventDefault();
    });
})();
```

## License

MIT
