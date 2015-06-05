# Polyfills

> A way of getting the browser to behave and support the latest specifications.

This is my own collection of code snippets that support different native features of browsers using JavaScript (and if required, Flash in some cases).

## Component Installation

You can install polyfills using component:

```
component install remy/polyfills
```

If you'd like to include all polyfills (except device motion), you can just:

```
require( 'polyfills' );
```

If you'd only like a specific polyfill, you can require indivual ones like this:

```
require( 'polyfills/classList' );

// now we can use classList in lots of browsers!
element.classList.add( 'foo' );
```

# License

License: http://rem.mit-license.org
