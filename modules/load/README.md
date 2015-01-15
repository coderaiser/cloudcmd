# Load.js

Dynamically loading external JavaScript and CSS files 

## Install

```
bower install load
```

## How use?
Create `html` page with `js` connected.

```html
<script src="load.min.js"></script>
```

Than try one of this:

```js
load.js('jquery.js', function(error) {
    /* you could use jquery functions here */
});

load.css('menu.css', function(error) {
    /* load menu css and then do some magic */
});

/* recognition file type by extension */
load('css-or-.js', function(error, event) {
    console.log(error || event);
});

load('template/footer.html', function(error, footer) {
    console.log(error || footer);
});

load.json('config.json', function(error, config) {
    console.log(error || config);
});

load.ajax('template/header.html', function(error, header) {
    console.log(error || header);
});

/* load one-by-one */
load.series([
    'jquery.js',
    'jq-console.js',
], function() {
});

/* load all together and call callback */
load.parallel([
    'menu.css',
    'menu.js',
], function() {
});
```

## License

MIT
