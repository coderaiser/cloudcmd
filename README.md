# Cloud Commander v12.1.0 [![Build Status][BuildStatusIMGURL]][BuildStatusURL] [![Now status][BuildAppveyorIMGURL]][BuildAppveyorURL] [![Codacy][CodacyIMG]][CodacyURL] [![Gitter][GitterIMGURL]][GitterURL] [![OpenCollective](https://opencollective.com/cloudcmd/backers/badge.svg)](#backers) [![OpenCollective](https://opencollective.com/cloudcmd/sponsors/badge.svg)](#sponsors)

### [Main][MainURL] [Blog][BlogURL] Live([Heroku][HerokuURL], [Now][NowURL])

[NPM_INFO_IMG]:             https://nodei.co/npm/cloudcmd.png
[MainURL]:                  http://cloudcmd.io "Main"
[BlogURL]:                  http://blog.cloudcmd.io "Blog"
[HerokuURL]:                https://cloudcmd.herokuapp.com/ "Heroku"
[NowURL]:                   https://cloudcmd.now.sh/ "Now"
[BuildStatusURL]:           https://travis-ci.org/coderaiser/cloudcmd  "Build Status"
[BuildStatusIMGURL]:        https://img.shields.io/travis/coderaiser/cloudcmd.svg?style=flat-squere&longCache=true

[BuildAppveyorURL]:         https://ci.appveyor.com/project/coderaiser/cloudcmd
[BuildAppveyorIMGURL]:      https://ci.appveyor.com/api/projects/status/tse6sc8dxrqxqehi?svg=true

[CodacyURL]:                https://www.codacy.com/app/coderaiser/cloudcmd
[CodacyIMG]:                https://api.codacy.com/project/badge/Grade/ddda78be780549ce8754f8d47a8c0e36

[GitterURL]:                https://gitter.im/cloudcmd/hello
[GitterIMGURL]:             https://img.shields.io/gitter/room/coderaiser/cloudcmd.js.svg

[DeployURL]:                https://heroku.com/deploy?template=https://github.com/coderaiser/cloudcmd "Deploy"
[DeployIMG]:                https://www.herokucdn.com/deploy/button.png

**Cloud Commander** a file manager for the web with console and editor.

![Cloud Commander](https://cloudcmd.io/img/logo/cloudcmd.png "Cloud Commander")

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

### View

You will see something similar to this.
![View](https://cloudcmd.io/img/screen/view.png "View")


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
const prefix = '/';

const server = http.createServer(app);
const socket = io.listen(server, {
    path: `${prefix}/socket.io`
});

const config = {
    name: 'cloudcmd :)',
};

const plugins = [
    __dirname + '/plugin.js'
];

const filePicker = {
    data: {
        FilePicker: {
            key: 'key',
        }
    }
};

// override option from json/modules.json
const modules = {
    filePicker,
};

app.use(prefix, cloudcmd({
    socket,  // used by Config, Edit (optional) and Console (required)
    config,  // config data (optional)
    plugins, // optional
    modules, // optional
}));

server.listen(port);
```

Docker
---------------
`Cloud Commander` could be used as a [docker container](https://hub.docker.com/r/coderaiser/cloudcmd/ "Docker container") this way:

```sh
docker run -t --rm -v ~:/root -v /:/mnt/fs -w=/root -p 8000:8000 coderaiser/cloudcmd
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

Get involved
---------------

There is a lot ways to be involved in `Cloud Commander` development:

- if you find a bug or got idea to share [create an issue](https://github.com/coderaiser/cloudcmd/issues/new "Create issue");
- if you fixed a bug, typo or implemented new feature [create pull request](https://github.com/coderaiser/cloudcmd/compare "Create pull request");
- if you know languages you can help with [site translations](https://github.com/coderaiser/cloudcmd/wiki "Cloud Commander community wiki");

## Backers
Support us with a monthly donation and help us continue our activities. [[Become a backer](https://opencollective.com/cloudcmd#backer)]

[![](https://opencollective.com/cloudcmd/backer/0/avatar.svg)](https://opencollective.com/cloudcmd/backer/0/website)
[![](https://opencollective.com/cloudcmd/backer/1/avatar.svg)](https://opencollective.com/cloudcmd/backer/1/website)
[![](https://opencollective.com/cloudcmd/backer/2/avatar.svg)](https://opencollective.com/cloudcmd/backer/2/website)
[![](https://opencollective.com/cloudcmd/backer/3/avatar.svg)](https://opencollective.com/cloudcmd/backer/3/website)
[![](https://opencollective.com/cloudcmd/backer/4/avatar.svg)](https://opencollective.com/cloudcmd/backer/4/website)
[![](https://opencollective.com/cloudcmd/backer/5/avatar.svg)](https://opencollective.com/cloudcmd/backer/5/website)
[![](https://opencollective.com/cloudcmd/backer/6/avatar.svg)](https://opencollective.com/cloudcmd/backer/6/website)
[![](https://opencollective.com/cloudcmd/backer/7/avatar.svg)](https://opencollective.com/cloudcmd/backer/7/website)
[![](https://opencollective.com/cloudcmd/backer/8/avatar.svg)](https://opencollective.com/cloudcmd/backer/8/website)
[![](https://opencollective.com/cloudcmd/backer/9/avatar.svg)](https://opencollective.com/cloudcmd/backer/9/website)
[![](https://opencollective.com/cloudcmd/backer/10/avatar.svg)](https://opencollective.com/cloudcmd/backer/10/website)
[![](https://opencollective.com/cloudcmd/backer/11/avatar.svg)](https://opencollective.com/cloudcmd/backer/11/website)
[![](https://opencollective.com/cloudcmd/backer/12/avatar.svg)](https://opencollective.com/cloudcmd/backer/12/website)
[![](https://opencollective.com/cloudcmd/backer/13/avatar.svg)](https://opencollective.com/cloudcmd/backer/13/website)
[![](https://opencollective.com/cloudcmd/backer/14/avatar.svg)](https://opencollective.com/cloudcmd/backer/14/website)
[![](https://opencollective.com/cloudcmd/backer/15/avatar.svg)](https://opencollective.com/cloudcmd/backer/15/website)
[![](https://opencollective.com/cloudcmd/backer/16/avatar.svg)](https://opencollective.com/cloudcmd/backer/16/website)
[![](https://opencollective.com/cloudcmd/backer/17/avatar.svg)](https://opencollective.com/cloudcmd/backer/17/website)
[![](https://opencollective.com/cloudcmd/backer/18/avatar.svg)](https://opencollective.com/cloudcmd/backer/18/website)
[![](https://opencollective.com/cloudcmd/backer/19/avatar.svg)](https://opencollective.com/cloudcmd/backer/19/website)
[![](https://opencollective.com/cloudcmd/backer/20/avatar.svg)](https://opencollective.com/cloudcmd/backer/20/website)
[![](https://opencollective.com/cloudcmd/backer/21/avatar.svg)](https://opencollective.com/cloudcmd/backer/21/website)
[![](https://opencollective.com/cloudcmd/backer/22/avatar.svg)](https://opencollective.com/cloudcmd/backer/22/website)
[![](https://opencollective.com/cloudcmd/backer/23/avatar.svg)](https://opencollective.com/cloudcmd/backer/23/website)
[![](https://opencollective.com/cloudcmd/backer/24/avatar.svg)](https://opencollective.com/cloudcmd/backer/24/website)
[![](https://opencollective.com/cloudcmd/backer/25/avatar.svg)](https://opencollective.com/cloudcmd/backer/25/website)
[![](https://opencollective.com/cloudcmd/backer/26/avatar.svg)](https://opencollective.com/cloudcmd/backer/26/website)
[![](https://opencollective.com/cloudcmd/backer/27/avatar.svg)](https://opencollective.com/cloudcmd/backer/27/website)
[![](https://opencollective.com/cloudcmd/backer/28/avatar.svg)](https://opencollective.com/cloudcmd/backer/28/website)
[![](https://opencollective.com/cloudcmd/backer/29/avatar.svg)](https://opencollective.com/cloudcmd/backer/29/website)

## Sponsors
Become a sponsor and get your logo on our README on Github with a link to your site. [[Become a sponsor](https://opencollective.com/cloudcmd#sponsor)]

[![](https://opencollective.com/cloudcmd/sponsor/0/avatar.svg)](https://opencollective.com/cloudcmd/sponsor/0/website)
[![](https://opencollective.com/cloudcmd/sponsor/1/avatar.svg)](https://opencollective.com/cloudcmd/sponsor/1/website)
[![](https://opencollective.com/cloudcmd/sponsor/2/avatar.svg)](https://opencollective.com/cloudcmd/sponsor/2/website)
[![](https://opencollective.com/cloudcmd/sponsor/3/avatar.svg)](https://opencollective.com/cloudcmd/sponsor/3/website)
[![](https://opencollective.com/cloudcmd/sponsor/4/avatar.svg)](https://opencollective.com/cloudcmd/sponsor/4/website)
[![](https://opencollective.com/cloudcmd/sponsor/5/avatar.svg)](https://opencollective.com/cloudcmd/sponsor/5/website)
[![](https://opencollective.com/cloudcmd/sponsor/6/avatar.svg)](https://opencollective.com/cloudcmd/sponsor/6/website)
[![](https://opencollective.com/cloudcmd/sponsor/7/avatar.svg)](https://opencollective.com/cloudcmd/sponsor/7/website)
[![](https://opencollective.com/cloudcmd/sponsor/8/avatar.svg)](https://opencollective.com/cloudcmd/sponsor/8/website)
[![](https://opencollective.com/cloudcmd/sponsor/9/avatar.svg)](https://opencollective.com/cloudcmd/sponsor/9/website)
[![](https://opencollective.com/cloudcmd/sponsor/10/avatar.svg)](https://opencollective.com/cloudcmd/sponsor/10/website)
[![](https://opencollective.com/cloudcmd/sponsor/11/avatar.svg)](https://opencollective.com/cloudcmd/sponsor/11/website)
[![](https://opencollective.com/cloudcmd/sponsor/12/avatar.svg)](https://opencollective.com/cloudcmd/sponsor/12/website)
[![](https://opencollective.com/cloudcmd/sponsor/13/avatar.svg)](https://opencollective.com/cloudcmd/sponsor/13/website)
[![](https://opencollective.com/cloudcmd/sponsor/14/avatar.svg)](https://opencollective.com/cloudcmd/sponsor/14/website)
[![](https://opencollective.com/cloudcmd/sponsor/15/avatar.svg)](https://opencollective.com/cloudcmd/sponsor/15/website)
[![](https://opencollective.com/cloudcmd/sponsor/16/avatar.svg)](https://opencollective.com/cloudcmd/sponsor/16/website)
[![](https://opencollective.com/cloudcmd/sponsor/17/avatar.svg)](https://opencollective.com/cloudcmd/sponsor/17/website)
[![](https://opencollective.com/cloudcmd/sponsor/18/avatar.svg)](https://opencollective.com/cloudcmd/sponsor/18/website)
[![](https://opencollective.com/cloudcmd/sponsor/19/avatar.svg)](https://opencollective.com/cloudcmd/sponsor/19/website)
[![](https://opencollective.com/cloudcmd/sponsor/20/avatar.svg)](https://opencollective.com/cloudcmd/sponsor/20/website)
[![](https://opencollective.com/cloudcmd/sponsor/21/avatar.svg)](https://opencollective.com/cloudcmd/sponsor/21/website)
[![](https://opencollective.com/cloudcmd/sponsor/22/avatar.svg)](https://opencollective.com/cloudcmd/sponsor/22/website)
[![](https://opencollective.com/cloudcmd/sponsor/23/avatar.svg)](https://opencollective.com/cloudcmd/sponsor/23/website)
[![](https://opencollective.com/cloudcmd/sponsor/24/avatar.svg)](https://opencollective.com/cloudcmd/sponsor/24/website)
[![](https://opencollective.com/cloudcmd/sponsor/25/avatar.svg)](https://opencollective.com/cloudcmd/sponsor/25/website)
[![](https://opencollective.com/cloudcmd/sponsor/26/avatar.svg)](https://opencollective.com/cloudcmd/sponsor/26/website)
[![](https://opencollective.com/cloudcmd/sponsor/27/avatar.svg)](https://opencollective.com/cloudcmd/sponsor/27/website)
[![](https://opencollective.com/cloudcmd/sponsor/28/avatar.svg)](https://opencollective.com/cloudcmd/sponsor/28/website)
[![](https://opencollective.com/cloudcmd/sponsor/29/avatar.svg)](https://opencollective.com/cloudcmd/sponsor/29/website)

## License

MIT

