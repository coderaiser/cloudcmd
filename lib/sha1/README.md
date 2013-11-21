# Rusha
*A high-performance pure-javascript SHA1 implementation suitable for large binary data.*

## Prologue: The Sad State of Javascript SHA1 implementations

When we started experimenting with alternative upload technologies at [doctape](http://doctape.com) that required creating SHA1 hashes of the data locally on the client, it quickly became obvious that there were no performant pure-js implementations of SHA1 that worked correctly on binary data.

Jeff Mott's [CryptoJS](http://code.google.com/p/crypto-js/) and Brian Turek's [jsSHA](http://caligatio.github.com/jsSHA/) were both hash functions that worked correctly on ASCII strings of a small size, but didn't scale to large data and/or didn't work correctly with binary data.

(On a sidenode, as of now Tim Caswell's [Cifre](http://github.com/openpeer/cifre) actually works with large binary data, as opposed to previously statet.)

By modifying Paul Johnston's [sha1.js](http://pajhome.org.uk/crypt/md5/sha1.html) slightly, it worked correctly on binary data but was unfortunately very slow, especially on V8. So a few days were invested on my side to implement a Johnston-inspired SHA1 hashing function with a heavy focus on performance.

The result of this process is Rusha, a SHA1 hash function that works flawlessly on large amounts binary data, such as binary strings or ArrayBuffers returned by the HTML5 File API, and leverages the soon-to-be-landed-in-firefox [asm.js](http://asmjs.org/spec/latest/) with whose support its within *half of native speed*!

## Installing

### Node.JS

There is really no point in doing this, since Node.JS already has a wonderful `crypto` module that is leveraging low-level hardware instructions to perform really nice. Your can see the comparison below in the benchmarks.

Rusha is available on [npm](http://npmjs.org/) via `npm install rusha`.

If you still want to do this, anyhow, just `require()` the `rusha.js` file, follow the instructions on _Using the Rusha Object_.

### Browser

Rusha is available on [bower](http://twitter.github.com/bower/) via `bower install rusha`.

It is highly recommended to run CPU-intensive tasks in a [Web Worker](http://developer.mozilla.org/en-US/docs/DOM/Using_web_workers). To do so, just start a worker with `var worker = new Worker('rusha.js')` and start sending it jobs. Follow the instructions on _Using the Rusha Worker_.

If you can't, for any reason, use Web Workers, include the `rusha.js` file in a `<script>` tag and follow the instructions on _Using the Rusha Object_.

## Using the Rusha Object

Your instantiate a new Rusha object by doing `var r = new Rusha(optionalSizeHint)`. When created, it provides the following methods:

- `Rusha#digest(d)`: Create a hex digest from data of the three kinds mentioned below, or throw and error if the type is unsupported.
- `Rusha#digestFromString(s)`: Create a hex digest from a binary `String`. A binary string is expected to only contain characters whose charCode < 256.
- `Rusha#digestFromBuffer(b)`: Create a hex digest from a `Buffer` or `Array`. Both are expected to only contain elements < 256.
- `Rusha#digestFromArrayBuffer(a)`: Create a hex digest from an `ArrayBuffer` object.
- `Rusha#rawDigest(d)`: Behaves just like #digest(d), except that it returns the digest as an Int32Array of size 5.

## Using the Rusha Worker

You can send your instance of the web worker messages in the format `{id: jobid, data: dataobject}`. The worker then sends back a message in the format `{id: jobid, hash: hash}`, were jobid is the id of the job previously received and hash is the hash of the data-object you passed, be it a `Blob`, `Array`, `Buffer`, `ArrayBuffer` or `String`.

## Benchmarks

Tested were my Rusha implementation, the sha1.js implementation by [P. A. Johnston](http://pajhome.org.uk/crypt/md5/sha1.html), Tim Caswell's [Cifre](http://github.com/openpeer/cifre) and the Node.JS native implementation.

If you want to check the performance for yourself in your own browser, I compiled a [JSPerf Page](http://jsperf.com/rusha/2).

A normalized estimation based on the best results for each implementation, smaller is better:
![rough performance graph](http://awesam.de/rusha/bench/unscientific01.png)

Results per Implementation and Platform:
![performance chart](https://docs.google.com/spreadsheet/oimg?key=0Ag9CYh5kHpegdDB1ZG16WU1xVFgxdjRuQUVwQXRnWVE&oid=1&zx=pcatr2aits9)

All tests were performed on a MacBook Air 1.7 GHz Intel Core i5 and 4 GB 1333 MHz DDR3.
