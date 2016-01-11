# Cloud Commander v5.0.5 [![License][LicenseIMGURL]][LicenseURL] [![NPM version][NPMIMGURL]][NPMURL] [![Dependency Status][DependencyStatusIMGURL]][DependencyStatusURL] [![Build Status][BuildStatusIMGURL]][BuildStatusURL] [![Circle Ci][CircleCiIMGURL]][CircleCiURL] [![Package Quality][PackageQualityIMGURL]][PackageQualityURL]

### [Main][MainURL] [Blog][BlogURL] Live([JitSu][JitSuURL], [Heroku][HerokuURL])

[NPM_INFO_IMG]:             https://nodei.co/npm/cloudcmd.png
[MainURL]:                  http://cloudcmd.io "Main"
[BlogURL]:                  http://blog.cloudcmd.io "Blog"
[JitSuURL]:                 http://cloudcmd.jit.su "JitSu"
[HerokuURL]:                http://cloudcmd.herokuapp.com/ "Heroku"
[NPMURL]:                   https://npmjs.org/package/cloudcmd "npm"
[NPMIMGURL]:                https://img.shields.io/npm/v/cloudcmd.svg?style=flat
[LicenseURL]:               https://tldrlegal.com/license/mit-license "MIT License"
[LicenseIMGURL]:            https://img.shields.io/badge/license-MIT-317BF9.svg?style=flat
[DependencyStatusURL]:      https://gemnasium.com/coderaiser/cloudcmd "Dependency Status"
[DependencyStatusIMGURL]:   https://img.shields.io/gemnasium/coderaiser/cloudcmd.svg?style=flat
[BuildStatusURL]:           https://travis-ci.org/coderaiser/cloudcmd  "Build Status"
[BuildStatusIMGURL]:        https://img.shields.io/travis/coderaiser/cloudcmd.svg?style=flat

[PackageQualityURL]:        http://packagequality.com/#?package=cloudcmd "Package Quality"
[PackageQualityIMGURL]:     http://packagequality.com/shield/cloudcmd.svg

[CircleCiURL]:              https://circleci.com/gh/coderaiser/cloudcmd
[CircleCiIMGURL]:           https://circleci.com/gh/coderaiser/cloudcmd.svg

[DeployURL]:                https://heroku.com/deploy?template=https://github.com/coderaiser/cloudcmd "Deploy"
[DeployIMG]:                https://www.herokucdn.com/deploy/button.png

**Cloud Commander** orthodox web file manager with console and editor.

![Cloud Commander](http://cloudcmd.io/img/logo/cloudcmd.png "Cloud Commander")

## Install

```
npm i cloudcmd -g
```
## Start

For starting just type in console:

```sh
cloudcmd
```

## How to use?

Open url `http://localhost:8000` in browser.

[![Deploy][DeployIMG]][DeployURL]

## Using as Middleware

Cloud Commander could be used as middleware for `node.js` applications based on [socket.io](http://socket.io "Socket.IO") and [express](http://expressjs.com "Express"):

```js
var http        = require('http'),
    cloudcmd    = require('cloudcmd'),
    express     = require('express'),
    io          = require('socket.io'),
    app         = express(),
    
    PORT        = 1337,
    
    server,
    socket;
    
server = http.createServer(app);
socket = io.listen(server);

app.use(cloudcmd({
    socket: socket,     /* used by Config, Edit (optional) and Console (required)   */
    config: {           /* config data (optional)                                   */
        prefix: '/cloudcmd', /* base URL or function which returns base URL (optional)   */
    }
}));

server.listen(PORT);
```

## License

MIT

