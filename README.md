# Cloud Commander v5.7.4 [![License][LicenseIMGURL]][LicenseURL] [![NPM version][NPMIMGURL]][NPMURL] [![Dependency Status][DependencyStatusIMGURL]][DependencyStatusURL] [![Build Status][BuildStatusIMGURL]][BuildStatusURL] [![Package Quality][PackageQualityIMGURL]][PackageQualityURL] [![Codacy][CodacyIMG]][CodacyURL] [![Gitter][GitterIMGURL]][GitterURL]

### [Main][MainURL] [Blog][BlogURL] Live([Heroku][HerokuURL])

[NPM_INFO_IMG]:             https://nodei.co/npm/cloudcmd.png
[MainURL]:                  http://cloudcmd.io "Main"
[BlogURL]:                  http://blog.cloudcmd.io "Blog"
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

[CodacyURL]:                https://www.codacy.com/app/coderaiser/cloudcmd
[CodacyIMG]:                https://api.codacy.com/project/badge/Grade/ddda78be780549ce8754f8d47a8c0e36

[GitterURL]:                https://gitter.im/cloudcmd
[GitterIMGURL]:             https://img.shields.io/gitter/room/coderaiser/cloudcmd.js.svg

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

## Deploy
`Cloud Commander` could be easily deployed to [Heroku][DeployURL].

[![Deploy][DeployIMG]][DeployURL]

## Using as Middleware

Cloud Commander could be used as middleware for `node.js` applications based on [socket.io](http://socket.io "Socket.IO") and [express](http://expressjs.com "Express"):

Init `package.json`:

```
npm init -y
```

Install dependencies:

```
npm i cloudcmd express socket.io -S
```

And create `index.js`:

```js
const http = require('http');
const cloudcmd = require('cloudcmd');
const io = require('socket.io');
const app = require('express')();

const port = 1337;
const prefix = '/cloudcmd';

const server = http.createServer(app);
const socket = io.listen(server, {
    path: `${prefix}/socket.io'
});

const config = {
    prefix /* base URL or function which returns base URL (optional)   */
}

app.use(cloudcmd({
    socket, /* used by Config, Edit (optional) and Console (required)   */
    config, /* config data (optional)                                   */
}));

server.listen(port);
```

Docker
---------------
`Cloud Commander` could be used as [docker container](https://hub.docker.com/r/coderaiser/cloudcmd/ "Docker container") this way:

```sh
docker run -v ~:/root -v /:/mnt/fs -t -p 8000:8000 coderaiser/cloudcmd
```

Config would be read from home directory, hosts root file system would be mount to `/mnt/fs`,
`8000` port would be exposed to hosts port.

Also you could use [docker compose](https://docs.docker.com/compose/ "Docker Compose") with `docker-compose.yml`:

```yml
version: '2'
services:
  web:
    ports:
      - 8000:8000
    volumes:
      - ~:/root
      - /:/mnt/fs
    image: coderaiser/cloudcmd
```

When you create this file run:

```sh
docker-compose up
```

## License

MIT

