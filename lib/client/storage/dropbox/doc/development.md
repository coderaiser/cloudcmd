# dropbox.js Development

Read this document if you want to build `dropbox.js` or modify its source code.
If you want to write applications using dropbox.js, check out the
[Getting Started](getting_started.md).

The library is written using [CoffeeScript](http://coffeescript.org/), built
using [cake](http://coffeescript.org/documentation/docs/cake.html), minified
using [uglify.js](https://github.com/mishoo/UglifyJS/), tested using
[mocha](http://visionmedia.github.com/mocha/) and
[chai.js](http://chaijs.com/), and packaged using [npm](https://npmjs.org/).

If you don't "speak" CoffeeScript,
[this document](https://github.com/dropbox/dropbox-js/blob/master/doc/coffee_faq.md)
might address some of your concerns.


## Dev Environment Setup

Install [node.js](http://nodejs.org/#download) to get `npm` (the node
package manager), then use it to install the libraries required by the test
suite.

```bash
git clone https://github.com/dropbox/dropbox-js.git
cd dropbox-js
npm install
```

## Build

Run `npm pack` and ignore any deprecation warnings that might come up.

```bash
npm pack
```

The build output is in the `lib/` directory. `dropbox.js` is the compiled
library that ships in the npm package, and `dropbox.min.js` is a minified
version, optimized for browser apps.


## Test

First, you will need to obtain a couple of Dropbox tokens that will be used by
the automated tests.

```bash
cake tokens
```

Re-run the command above if the tests fail due to authentication errors.

Once you have Dropbox tokens, you can run the test suite in node.js or in your
default browser.

```bash
cake test
cake webtest
```

The library is automatically re-built when running tests, so you don't need to
run `npm pack`. Please run the tests in both node.js and a browser before
submitting pull requests.

The tests store all their data in folders named along the lines of
`js tests.0.ac1n6lgs0e3lerk9`. If tests fail, you might have to clean up these
folders yourself.


## Testing Chrome Extension

The test suite opens up a couple of Dropbox authorization pages, and a page
that cannot close itself. dropbox.js ships with a Google Chrome extension that
can fully automate the testing process on Chrome.

The extension is written in CoffeeScript, so you will have to compile it.

```bash
cake extension
```

After compilation, have Chrome load the unpacked extension at
`test/chrome_extension` and click on the scary-looking toolbar icon to activate
the extension. The icon's color should turn red, to indicate that it is active.

The extension performs some checks to prevent against attacks. However, for
best results, you should disable the automation (by clicking on the extension
icon) when you're not testing dropbox.js.
