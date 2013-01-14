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

Install the CoffeeScript npm package globally, so you can type `cake` instead
of `node_modules/coffee-script/bin/cake`.

```bash
npm install -g coffee-script
```

First, you will need to obtain a couple of Dropbox tokens that will be used by
the automated tests.

```bash
cake tokens
```

Re-run the command above if the tests fail due to authentication errors.

Once you have Dropbox tokens, you can run the test suite in node.js, in your
default browser, or as a Chrome application.

```bash
cake test
cake webtest
cake chrometest
```

The library is automatically re-built when running tests, so you don't need to
run `npm pack`. Please run the tests in both node.js and a browser before
submitting pull requests.

The tests store all their data in folders named along the lines of
`js tests.0.ac1n6lgs0e3lerk9`. If tests fail, you might have to clean up these
folders yourself.


### Solving Browser Issues

An easy method to test a browser in a virtual machine is to skip the automated
browser opening.

```bash
BROWSER=false cake webtest
```

A similar method can be used to launch a specific browser.

```bash
BROWSER=firefox cake webtest
```

When fighting a bug, it can be useful to keep the server process running after
the test suite completes, so tests can be re-started with a browser refresh.

```bash
BROWSER=false NO_EXIT=1 cake webtest
```

[Mocha's exclusive tests](http://visionmedia.github.com/mocha/#exclusive-tests)
(`it.only` and `describe.only`) are very useful for quickly iterating while
figuring out a bug.


### Chrome Application / Extension Testing

The tests for Chrome apps / extensions require manual intervention right now.

The `cake chrometest` command will open a Google Chrome instance. The
`dropbox.js Test Suite` application must be clicked.


### Fully Automated Tests

The test suite opens up the Dropbox authorization page a few times, and also
pops up a page that cannot close itself. dropbox.js ships with a Google Chrome
extension that can fully automate the testing process on Chrome / Chromium.

The extension is written in CoffeeScript, so you will have to compile it.

```bash
cake extension
```

After compilation, have Chrome load the unpacked extension at
`test/chrome_extension` and click on the scary-looking toolbar icon to activate
the extension. The icon's color should turn red, to indicate that it is active.

The extension performs some checks to prevent against attacks. However, you
should still disable the automation (by clicking on the extension icon) when
you're not testing dropbox.js, just in case the extension code has bugs.


## Release Process

1. At the very least, test in node.js and in a browser before releasing.

```bash
cake test
cake webtest
```

1. Bump the version in `package.json`.

1. Publish a new npm package.

```bash
npm publish
```

1. Commit and tag the version bump on GitHub.

```bash
git add package.json
git commit -m "Release X.Y.Z."
git tag -a -m "Release X.Y.Z" vX.Y.Z
git push
git push --tags
```

1. If you haven't already, go to the
   [cdnjs GitHub page](https://github.com/cdnjs/cdnjs) and fork it.

1. If you haven't already, set up cdnjs on your machine.

```bash
cd ..
git clone git@github.com:you/cdnjs.git
cd cdnjs
git remote add up git://github.com/cdnjs/cdnjs.git
cd ../dropbox-js
```

1. Add the new release to your cdnjs fork.

```bash
cd ../cdnjs
git checkout master
git pull up master
npm install
git checkout -b dbXYZ
mkdir ajax/libs/dropbox.js/X.Y.Z
cp ../dropbox-js/lib/dropbox.min.js ajax/libs/dropbox.js/X.Y.Z/
vim ajax/libs/dropbox.js/package.json  # Replace "version"'s value with "X.Y.Z"
npm test
git add -A
git commit -m "Added dropbox.js X.Y.Z"
git push origin dbXYZ
```

1. Go to your cdnjs for on GitHub and open a pull request. Use these examples
of accepted
[major release pull request](https://github.com/cdnjs/cdnjs/pull/735) and
[minor release pull request](https://github.com/cdnjs/cdnjs/pull/753).
