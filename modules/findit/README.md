# DOM File System Findit

Similar to [node-findit](https://github.com/substack/node-findit "Node Findit") but for [Dom File System](https://developer.mozilla.org/en-US/docs/Web/API/FileSystem "Dom File System").

## Install

```
bower i findit --save
```

## How to use?

Add `findit.js` and [emitify](https://github.com/coderaiser/emitify "Emitify").
Or any other node-compitable [EventEmitter](https://iojs.org/api/events.html "Events") (set `window.Emitify = your_emitter` before using `findit`).

```html
<script src="modules/emitify/lib/emitify.js"></script>
<script src="lib/findit.js"></script>
```

```js
var node = window;

node.addEventListener('drop', function (e) {
    var entry,
        finder,
        item = e.dataTransfer.items[0];
    
    e.preventDefault();
    
    entry = item.webkitGetAsEntry();
    
    finder = findit(entry);
    
    finder.on('file', function(file, entry) {
        console.log('file: ', file, entry);
    });
    
    finder.on('directory', function(file, entry) {
        console.log('directory: ', file, entry);
    })
    
    finder.on('end', function() {
        console.log('done');
    })
});
    
node.addEventListener('dragover', function (e) {
    e.preventDefault();
});
```

## License

MIT
