# Rendy [![License][LicenseIMGURL]][LicenseURL] [![NPM version][NPMIMGURL]][NPMURL] [![Dependency Status][DependencyStatusIMGURL]][DependencyStatusURL] [![Build Status][BuildStatusIMGURL]][BuildStatusURL]
Simple template engine compatible with [handlebars](http://handlebarsjs.com "Handlebars") and [mustache](https://mustache.github.io "Mustache").

## Install
![NPM_INFO][NPM_INFO_IMG]

`npm i rendy --save`

## How to use?
Rendy could be used in browser or node.

Browser version:

```html
<script src="rendy.js"></script>
<script>
    var Tmpl    = 'hello {{ where }}';
        result  = rendy(Tmpl, {
            where: 'in browser'
        });
        // returns
        'hello in browser'
</script>
```

Node version:

```js
var rendy   = require('rendy'),
    Tmpl    = 'hello {{ who }}';
    result  = rendy(Tmpl, {
        who: 'world'
    });
    // returns
    'hello world'

```

## License

MIT

[NPM_INFO_IMG]:             https://nodei.co/npm/rendy.png?downloads&&stars&&downloadRank "npm install rendy"
[NPMIMGURL]:                https://img.shields.io/npm/v/rendy.svg?style=flat
[BuildStatusIMGURL]:        https://img.shields.io/travis/coderaiser/rendy/master.svg?style=flat
[DependencyStatusIMGURL]:   https://img.shields.io/gemnasium/coderaiser/rendy.svg?style=flat
[LicenseIMGURL]:            https://img.shields.io/badge/license-MIT-317BF9.svg?style=flat
[NPMURL]:                   https://npmjs.org/package/rendy "npm"
[BuildStatusURL]:           https://travis-ci.org/coderaiser/rendy  "Build Status"
[DependencyStatusURL]:      https://gemnasium.com/coderaiser/rendy "Dependency Status"
[LicenseURL]:               https://tldrlegal.com/license/mit-license "MIT License"

