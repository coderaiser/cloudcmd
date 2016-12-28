# iType [![License][LicenseIMGURL]][LicenseURL] [![NPM version][NPMIMGURL]][NPMURL] [![Dependency Status][DependencyStatusIMGURL]][DependencyStatusURL] [![Build Status][BuildStatusIMGURL]][BuildStatusURL] [![Coverage Status][CoverageIMGURL]][CoverageURL]

Improved type check.

## Install

```
npm i itype --save
```

## How to use?

```js
var itype = require('itype');

console.og(itype.string('hello'))
// returns
true

console.log(itype('world'));
// returns
'string'

console.log(itype.array([1, 2]));
// returns
true
```

## Environments

In old `node.js` environments that not fully supports `es2015`, `itype` could be used with:

```js
var itype = require('itype/legacy');
```

## License

MIT

[NPMIMGURL]:                https://img.shields.io/npm/v/itype.svg?style=flat
[BuildStatusIMGURL]:        https://img.shields.io/travis/coderaiser/itype/master.svg?style=flat
[DependencyStatusIMGURL]:   https://img.shields.io/gemnasium/coderaiser/itype.svg?style=flat
[LicenseIMGURL]:            https://img.shields.io/badge/license-MIT-317BF9.svg?style=flat
[NPMURL]:                   https://npmjs.org/package/itype "npm"
[BuildStatusURL]:           https://travis-ci.org/coderaiser/itype  "Build Status"
[DependencyStatusURL]:      https://gemnasium.com/coderaiser/itype "Dependency Status"
[LicenseURL]:               https://tldrlegal.com/license/mit-license "MIT License"

[CoverageURL]:              https://coveralls.io/github/coderaiser/itype?branch=master
[CoverageIMGURL]:           https://coveralls.io/repos/coderaiser/itype/badge.svg?branch=master&service=github

