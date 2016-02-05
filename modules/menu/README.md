Menu [![Build Status][BuildStatusIMGURL]][BuildStatusURL]
====
[BuildStatusURL]:           https://travis-ci.org/coderaiser/menu-io  "Build Status"
[BuildStatusIMGURL]:        https://api.travis-ci.org/coderaiser/menu-io.png?branch=gh-pages

Simple css-based context menu made for [Cloud Commander](http://cloudcmd.io).

Little bit better then other people do :).
So to see at work look [here](http://jsfiddle.net/coderaiser/mAUUz/).

#How come?

Tired to use js based libraries which use jquery and `.hover` classes insteed of `:hover` pseudo-selectors.

#Why should I care?

- `1.6kb` min & gzip for js.
- `1kb` min & gzip  for css.
- no dependencies.
- easy to use.
- easy to extend.

# Install
With help of [bower](http://bower.io "Bower").
```
bower install menu
```

#How use?
Create `html` page with `js` and `css` connected.

```html
<link rel="stylesheet" href="http://coderaiser.github.io/menu-io/menu.min.css">
<script src="http://coderaiser.github.io/menu-io/menu.min.js"></script>
```

Add little JavaScript:

```js
var menu        = MenuIO({
    'item name': function onItemNameClick() {
    }
}
```
You could use element and (or) options parameters if you need to.

```js
var element     = document.body,
    
    options     = {
        icon        : true, /* add class icon-item-name */
        beforeClose : alert,
        beforeShow  : alert,
        beforeClick : alert,
        name        : 'name of menu' /* if you want use a couple menu on one element */
    },
    
    menu        = MenuIO(element, options, {
        'item name': function onItemNameClick() {
    });
```

Look for `examples` directory or copy example from bottom:

```html
<link rel="stylesheet" href="http://coderaiser.github.io/menu-io/menu.min.css">
<script src="http://coderaiser.github.io/menu-io/menu-io.min.js"></script>
<script>
    window.addEventListener('load', function onLoad() {
        'use strict';
        
        window.removeEventListener('load', onLoad);
        var menu        = MenuIO({
            help: function() {
                alert('*help');
            },
            upload: {
                github: {
                    gist: function() {
                        alert('*gist');
                    },
                    main: function() {
                        alert('*main');
                    }
                },
                dropbox: function() {
                    alert('*dropbox');
                }
            }
        });
    });
</script>
```

#License
MIT
