#google-diff-match-patch unofficial mirror

This is an unofficial mirror of the JavaScript version of the google-diff-match-patch library. The code included is unmodified.

The software is licenced under the Apache License Version 2.0.

To install the library please use [bower](https://github.com/bower/bower) or simply clone this repository.

    bower install google-diff-match-patch-js

##Diff, Match and Patch Library
http://code.google.com/p/google-diff-match-patch/
Neil Fraser

This library is currently available in seven different ports, all using the same API.
Every version includes a full set of unit tests.

JavaScript:
* diff_match_patch_uncompressed.js is the human-readable version.
  Users of node.js should 'require' this uncompressed version since the
  compressed version is not guaranteed to work outside of a web browser.
* diff_match_patch.js has been compressed using Google's internal JavaScript compressor.
  Non-Google hackers who wish to recompress the source can use:
  http://dean.edwards.name/packer/

Demos:
* Separate demos for Diff, Match and Patch in JavaScript.
