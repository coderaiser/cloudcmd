# Cloud Commander v19.6.7 [![Build Status][BuildStatusIMGURL]][BuildStatusURL] [![Codacy][CodacyIMG]][CodacyURL] [![Gitter][GitterIMGURL]][GitterURL]

### [Main][MainURL] [Blog][BlogURL] [Support][SupportURL] [Demo][DemoURL]

[MainURL]: https://cloudcmd.io "Main"
[BlogURL]: https://blog.cloudcmd.io "Blog"
[SupportURL]: https://patreon.com/coderaiser "Patreon"
[DemoURL]: https://cloudcmd-zdp6.onrender.com
[NPM_INFO_IMG]: https://nodei.co/npm/cloudcmd.png
[BuildStatusURL]: https://github.com/coderaiser/cloudcmd/actions/workflows/nodejs.yml "Build Status"
[BuildStatusIMGURL]: https://github.com/coderaiser/cloudcmd/actions/workflows/nodejs.yml/badge.svg
[CodacyURL]: https://www.codacy.com/app/coderaiser/cloudcmd
[CodacyIMG]: https://api.codacy.com/project/badge/Grade/ddda78be780549ce8754f8d47a8c0e36
[GitterURL]: https://gitter.im/cloudcmd/hello
[GitterIMGURL]: https://img.shields.io/gitter/room/coderaiser/cloudcmd.js.svg
[DeployURL]: https://heroku.com/deploy?template=https://github.com/coderaiser/cloudcmd "Deploy"
[DeployIMG]: https://www.herokucdn.com/deploy/button.png

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
import http from 'node:http';
import {cloudcmd} from 'cloudcmd';
import {Server} from 'socket.io';
import express from 'express';

const app = express();

const port = 1337;
const prefix = '/';

const server = http.createServer(app);
const socket = new Server(server, {
    path: `${prefix}socket.io`,
});

const config = {
    name: 'cloudcmd :)',
};

const filePicker = {
    data: {
        FilePicker: {
            key: 'key',
        },
    },
};

// override option from json/modules.json
const modules = {
    filePicker,
};

const {
    createConfigManager,
    configPath,
} = cloudcmd;

const configManager = createConfigManager({
    configPath,
});

app.use(prefix, cloudcmd({
    socket, // used by Config, Edit (optional) and Console (required)
    config, // config data (optional)
    modules, // optional
    configManager, // optional
}));

server.listen(port);
```

## Docker

The docker images are provided for multiple architectures and types. The following list shows all existing images:

| Architecture   | Type         |
|----------------|--------------|
| amd64          | linux        |
| arm64 (arm/v8) | linux        |
| amd64          | linux-alpine |
| arm64 (arm/v8) | linux-alpine |

`Cloud Commander` could be used as a [docker container](https://hub.docker.com/r/coderaiser/cloudcmd/ "Docker container") this way:

```sh
docker run -it --rm -v ~:/root -v /:/mnt/fs -w=/root -p 8000:8000 coderaiser/cloudcmd
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

## Documentation

More documentation you can find on https://cloudcmd.io/.

## Get involved

There is a lot ways to be involved in `Cloud Commander` development:

- support project on patreon: https://patreon.com/coderaiser;
- if you find a bug or got idea to share [create an issue](https://github.com/coderaiser/cloudcmd/issues/new "Create issue");
- if you fixed a bug, typo or implemented new feature [create pull request](https://github.com/coderaiser/cloudcmd/compare "Create pull request");
- if you know languages you can help with [site translations](https://github.com/coderaiser/cloudcmd/wiki "Cloud Commander community wiki");

## License

MIT
