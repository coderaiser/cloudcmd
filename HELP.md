# Cloud Commander v6.14.4

### [Main][MainURL] [Blog][BlogURL] Live(![Heroku][Heroku_LIVE_IMG] [Heroku][HerokuURL])

[MainURL]:                  http://cloudcmd.io "Main"
[BlogURL]:                  http://blog.cloudcmd.io "Blog"
[HerokuURL]:                http://cloudcmd.herokuapp.com/ "Heroku"
[HEROKU_LIVE_IMG]:          https://status-io.cloudcmd.io/host/cloudcmd.herokuapp.com/img/txt.png "Heroku"

[DWORD]:                    https://github.com/cloudcmd/dword "Editor based on CodeMirror"
[EDWARD]:                   https://github.com/cloudcmd/edward "Editor based on Ace"
[DEEPWORD]:                 https://github.com/cloudcmd/deepword "Editor based on Monaco"
[EDWARD_KEYS]:              https://github.com/cloudcmd/edward/#hot-keys "Edward Hot keys"
[TERMUX]:                   https://termux.com "Termux"
[INLY]:                     https://github.com/coderaiser/node-inly "Extract archive"
**Cloud Commander** is an orthodox web file manager with console and editor. Will help you manage the server and work with files, directories and programs in browser from any computer, mobile or tablet.

![Cloud Commander](/img/logo/cloudcmd.png "Cloud Commander")

Benefits
---------------

- Open Source (**MIT License**).
- Has 2 classic panels.
- Optional **authorization**.
- Client works in web browser.
- Server works on **Windows**, **Linux**, **Mac OS** and **Android** (with help of [Termux][TERMUX]).
- Could be used local or remotely.
- Adapting to screen size.
- **3 built-in editors** with support of **syntax highlighting**: [Dword][DWORD], [Edward][EDWARD] and [Deepword][DEEPWORD].
- [Console](https://github.com/cloudcmd/console "Console") with support of default OS command line.
- Written in **JavaScript/Node.js**.
- Built-in archives pack: **zip** and **tar.gz**.
- Built-in archives extract: **zip**, **tar**, **gz**, **bz2**, **.tar.gz** and **.tar.bz2** (with help of [inly][INLY]).

Install
---------------

The installation of file manager is very simple.

- install latest version of [node.js](https://nodejs.org/ "node.js").
- install `cloudcmd` via `npm` with:

```sh
npm i cloudcmd -g
```

When in trouble use:

```sh
npm i cloudcmd -g --force
```

Start
---------------
For starting just type in console:

```sh
cloudcmd
```

Cloud Commander supports command line parameters:

|Parameter                      |Operation
|:------------------------------|:------------------------------
| `-h, --help`                  | display help and exit
| `-v, --version`               | display version and exit
| `-s, --save`                  | save configuration
| `-o, --online`                | load scripts from remote servers
| `-a, --auth`                  | enable authorization
| `-u, --username`              | set username
| `-p, --password`              | set password
| `-c, --config`                | configuration file path
| `--show-config`               | show config values
| `--editor`                    | set editor: "dword", "edward" or "deepword"
| `--packer`                    | set packer: "tar" or "zip"
| `--root`                      | set root directory
| `--prefix`                    | set url prefix
| `--port`                      | set port number
| `--minify`                    | enable minification
| `--progress`                  | show progress of file operations
| `--html-dialogs`              | use html dialogs
| `--open`                      | open web browser when server started
| `--one-panel-mode`            | set one panel mode
  `--config-dialog`             | enable config dialog
  `--console`                   | enable console
  `--terminal`                  | enable terminal
  `--terminal-path`             | set terminal path
| `--no-server`                 | do not start server
| `--no-auth`                   | disable authorization
| `--no-online`                 | load scripts from local server
| `--no-open`                   | do not open web browser when server started
| `--no-minify`                 | disable minification
| `--no-progress`               | do not show progress of file operations
| `--no-html-dialogs`           | do not use html dialogs
| `--no-one-panel-mode`         | unset one panel mode
| `--no-config-dialog`          | disable config dialog
| `--no-console`                | disable console
| `--no-terminal`               | disable terminal

If no parameters given Cloud Commander reads information from `~/.cloudcmd.json` and use
port from it (`8000` default). if port variables `PORT` or `VCAP_APP_PORT` isn't exist.

To begin use, type in address bar of your browser:

```
http://localhost:8000
```

Update
---------------
If you installed Cloud Commander with `npm`, stop application and
re-install it:

```sh
npm install cloudcmd -g
```

Then start it again, clear cache of your browser and reload page.

Hot keys
---------------

|Key                    |Operation
|:----------------------|:--------------------------------------------
| `F1`                  | help
| `F2`                  | rename
| `F3`                  | view
| `Shift + F3`          | view as `markdown`
| `F4`                  | edit
| `Shift + F4`          | edit in `vim` mode
| `F5`                  | copy
| `F6`                  | rename/move
| `F7`                  | new directory
| `Shift + F7`          | new file
| `F8`, `Delete`        | remove
| `Shift + Delete`      | remove without prompt
| `F9`                  | menu
| `F10`                 | config
| `*`                   | select/unselect all
| `+`                   | expand selection
| `-`                   | shrink selection
| `Ctrl + x`            | cut to buffer
| `Ctrl + с`            | copy to buffer
| `Ctrl + v`            | paste from buffer
| `Ctrl + z`            | clear buffer
| `Ctrl + r`            | refresh
| `Ctrl + d`            | clear local storage
| `Ctrl + a`            | select all files in a panel
| `Ctrl + m`            | rename selected files
| `Ctrl + u`            | swap panels
| `Ctrl + F3`           | sort by name
| `Ctrl + F5`           | sort by date
| `Ctrl + F6`           | sort by size
| `Up`, `Down`, `Enter` | file system navigation
| `Alt + Left/Right`    | show content of directory under cursor in target panel
| `Alt + g`             | go to directory
| `Ctrl + \`            | go to the root directory
| `Tab`                 | move via panels
| `Page Up`             | up on one page
| `Page Down`           | down on one page
| `Home`                | to begin of list
| `End`                 | to end of list
| `Space`               | select current file (and get size of directory)
| `Insert`              | select current file (and move to next)
| `F9`                  | context menu
| `~`                   | console
| `Ctrl + Click`        | open file on new tab

View
---------------
![View](/img/screen/view.png "View")

### Features
- View images.
- View text files.
- Playing audio.
- Playing video.

### Hot keys

|Key                    |Operation
|:----------------------|:--------------------------------------------
| `F3`                  | open
| `Esc`                 | close

Edit
---------------
![Edit](/img/screen/edit.png "Edit")

### Hot keys

|Key                    |Operation
|:----------------------|:--------------------------------------------
| `F4`                  | open
| `Shift + F4`          | open in `vim` mode
| `Esc`                 | close

For more details see [Edward hot keys][EDWARD_KEYS].

Console
---------------
![Console](/img/screen/console.png "Console")

### Hot keys

|Key                    |Operation
|:----------------------|:--------------------------------------------
| `~`                   | open
| `Ctrl + p`            | paste path of current directory
| `Esc`                 | close

For more details see [console hot keys](https://github.com/cloudcmd/console#hot-keys "Console Hot Keys").

Terminal
---------------
![Terminal](/img/screen/terminal.png "Terminal")

### Install

`Terminal` disabled and not installed by default. To use it you should install [gritty](https://github.com/cloudcmd/gritty "Gritty") with:

```sh
npm i gritty -g
```

And then set the path of a terminal with:

```sh
cloudcmd --terminal --terminal-path `gritty --path` --save
```

### Windows

On Windows you need to install `windows-build-tools` before:

```sh
npm install --global windows-build-tools
```

Then get path of a `gritty` with:

```sh
gritty --path
```
It will returns something like:

```sh
C:\Users\coderaiser\AppData\Roaming\npm\node_modules\gritty
```

Set this path as `--terminal-path` with:

```sh
cloudcmd --save --terminal --terminal-path "C:\Users\coderaiser\AppData\Roaming\npm\node_modules\gritty"
```

After that you can use `terminal` in the same way as a `console`.

### Hot keys

|Key                    |Operation
|:----------------------|:--------------------------------------------
| `Shift` + `~`         | open
| `Shift` + `Esc`       | close

Environment Variables
---------------

Every program executed in `console` or `terminal` has these `environment` variables:

- `ACTIVE_DIR` - directory that contains cursor
- `PASSIVE_DIR` - directory with no cursor
- `CURRENT_NAME` - name of a file under cursor
- `CURRENT_PATH` - path to file under cursor

On `Unix` you can use it this way:

```sh
~> echo $CURRENT_PATH
/home/coderaiser/cloudcmd/bin/cloudcmd.js
```

Config
---------------
![Config](/img/screen/config.png "Config")

### Hot keys

|Key                    |Operation
|:----------------------|:--------------------------------------------
| `F10`                 | open
| `Esc`                 | close

When you change one of options file `~/.cloudcmd.json` would be saved.
It could be edited manually with any text editor.
Here is description of options:

```js
{
    "auth"              : false,    /* enable http authentication               */
    "username"          : "root",   /* username for authentication              */
    "password"          : "toor",   /* password hash for authentication*/
    "algo"              : "sha512WithRSAEncryption", /* cryptographic algorithm */
    "editor"            : "edward", /* default, could be "dword" or "edward"    */
    "packer"            : "tar",    /* default, could be "tar" or "zip"         */
    "diff"              : true,     /* when save - send patch, not whole file   */
    "zip"               : true,     /* zip text before send / unzip before save */
    "localStorage"      : true,     /* local storage                            */
    "buffer"            : true,     /* buffer for copying files                 */
    "dirStorage"        : true,     /* store directory listing to localStorage  */
    "minify"            : false,    /* minification of js,css,html and img      */
    "online"            : true,     /* load js files from cdn or local path     */
    "open"              : false     /* open web browser when server started     */
    "cache"             : true,     /* add cache-control                        */
    "showKeysPanel"     : true,     /* show classic panel with buttons of keys  */
    "port"              : 8000,     /* http port                                */
    "ip"                : null,     /* ip or null(default)                      */
    "root"              : "/",      /* root directory                           */
    "prefix"            : "",       /* url prefix                               */
    "progress"          : true,     /* show progress of file operations         */
    "htmlDialogs"       : true,     /* use html dialogs                         */
    "onePanelMode"      : false,    /* set one panel mode                       */
    "configDialog"      : true,     /* enable config dialog                     */
    "console"           : true,     /* enable console                           */
    "terminal"          : false,    /* disable terminal                         */
    "terminalPath"      : '',       /* path of a terminal                       */
}
```

### Environment Variables

Some config options can be overridden with `environment variables` such:

- `CLOUDCMD_EDITOR` - set editor
- `CLOUDCMD_TERMINAL` - enable terminal
- `CLOUDCMD_TERMINAL_PATH` - set terminal path
- `CLOUDCMD_CONFIG_DIALOG` - enable config dialog
- `CLOUDCMD_AUTH` - enable authentication
- `CLOUDCMD_USERNAME` - set username
- `CLOUDCMD_PASSWORD` - set password

Menu
---------------
![Menu](/img/screen/menu.png "Menu")

Right mouse click button shows context menu with items:

- View
- Edit
- Rename
- Delete
- Pack
- Extract
- Upload To Cloud
- Download
- Cut
- Copy
- Paste
- New (File, Directory)
- Upload
- Upload From Cloud
- (Un)Select All
- Log Out (available when the `authorization` is enabled)

### Hot keys

|Key                    |Operation
|:----------------------|:--------------------------------------------
| `F9`                  | open
| `Esc`                 | close

One panel mode
---------------
Cloud Commander could work in one panel mode when screen size can not accommodate second panel or via `--one-panel-mode` options flag.
It could happen when mobile device, tablet or small window size used to work with file manager.

![One panel mode](/img/screen/one-panel-mode.png "One panel mode")

Using as Middleware
---------------

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
    path: `${prefix}/socket.io`
});

const config = {
    prefix /* base URL or function which returns base URL (optional)   */
};

const plugins = [
    __dirname + '/plugin.js'
];

const filePicker = {
    data: {
        FilePicker: {
            key: 'key'
        }
    }
};

// override option from json/modules.json
const modules = {filePicker};

app.use(cloudcmd({
    socket,  /* used by Config, Edit (optional) and Console (required)   */
    config,  /* config data (optional)                                   */
    plugins, /* optional */
    modules, /* optional */
}));

server.listen(port);
```

And you are ready to go.

Server
---------------
Standard practices say no non-root process gets to talk to
the Internet on a port less than 1024. Anyway I suggest you
to start Cloud Commander as non-root. How it could be solved?
There is a couple easy and fast ways. One of them is port forwarding.

### Iptables

Just run `shell/addtables.sh` for default options.

```sh
iptables -t nat -L # look rules before
iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-ports 8000
iptables -t nat -A PREROUTING -p tcp --dport 443 -j REDIRECT --to-ports 4430
iptables -t nat -L # look rules after
```

You should see something like this ( **8000** and **4430** should be in config as **port** and **sslPort** )

```sh
target     prot opt source               destination
REDIRECT   tcp  --  anywhere             anywhere             tcp dpt:http redir ports 8000
REDIRECT   tcp  --  anywhere             anywhere             tcp dpt:https redir ports 4430
```
If you would want to get things back just clear rules ( **1** and **2** it's rule numbers,
in your list they could differ).

```sh
iptables -t nat -D PREROUTING 2
iptables -t nat -D PREROUTING 1
```

### nginx
Get [nginx](http://nginx.org/ "nginx"). On Linux it could be done this way:

```sh
sudo apt-get install nginx #for ubuntu and debian
```

Then make host file **/etc/nginx/sites-available/io.cloudcmd.io**
( *io.cloudcmd.io* is your domain name) with content:

```sh
server {
    listen 80;
    client_max_body_size 100m;
    server_name io.cloudcmd.io;
    access_log /var/log/nginx/io.cloudcmd.io.access.log;
    location / {
        proxy_pass          http://127.0.0.1:8000/;
    }
}
```

If you want add **SSL**, add a couple lines to server block:

```sh
server {
    listen 443;
    client_max_body_size 100m;
    ssl                  on;
    ssl_certificate      /home/coderaiser/cloudcmd/ssl/ssl.crt;
    ssl_certificate_key  /home/coderaiser/cloudcmd/ssl/ssl.key;
    server_name io.cloudcmd.io;
    access_log /var/log/nginx/io.cloudcmd.io.access.log;
    location / {
        proxy_pass    http://127.0.0.1:8000/;
    }
}
```

For WebSocket support (nginx >= v1.3.13) modify server block:

```sh
    location / {
        proxy_http_version  1.1;
        proxy_set_header    Upgrade $http_upgrade;
        proxy_set_header    Connection "upgrade";

        proxy_pass          http://127.0.0.1:8000/;
    }
```


If you need redirection from **http** to **https**, it's simple:

```sh
server {
    listen 80;
    server_name admin.cloudcmd.io;
    rewrite ^ https://io.cloudcmd.io$request_uri? permanent; #301 redirect
    access_log /var/log/nginx/io.cloudcmd.io.access.log;
}
```

```sh
# create symlink of this file
ln -s ./sites-available/io.cloudcmd.io ./sites-enabled
# restart nginx
/etc/init.d/nginx restart
```

Deploy
---------------
`Cloud Commander` could be easily deployed to [Heroku](https://heroku.com/deploy?template=https://github.com/coderaiser/cloudcmd "Deploy to Heroku").

[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.png "Deploy to Heroku")]( https://heroku.com/deploy?template=https://github.com/coderaiser/cloudcmd)

Docker
---------------
`Cloud Commander` could be used as [docker container](https://hub.docker.com/r/coderaiser/cloudcmd/ "Docker container") this way:

```sh
docker run -t --rm -v ~:/root -v /:/mnt/fs -p 8000:8000 coderaiser/cloudcmd
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

- if you find a bug or got idea to share [create issue](https://github.com/coderaiser/cloudcmd/issues/new "Create issue");
- if you fixed a bug, typo or implemented new feature [create pull request](https://github.com/coderaiser/cloudcmd/compare "Create pull request");
- if you know languages you can help with [site translations](https://github.com/coderaiser/cloudcmd/wiki "Cloud Commander community wiki");

Version history
---------------
- *2017.05.25*, **[v6.14.4](//github.com/coderaiser/cloudcmd/releases/tag/v6.14.4)**
- *2017.05.22*, **[v6.14.3](//github.com/coderaiser/cloudcmd/releases/tag/v6.14.3)**
- *2017.05.18*, **[v6.14.2](//github.com/coderaiser/cloudcmd/releases/tag/v6.14.2)**
- *2017.05.18*, **[v6.14.1](//github.com/coderaiser/cloudcmd/releases/tag/v6.14.1)**
- *2017.05.17*, **[v6.14.0](//github.com/coderaiser/cloudcmd/releases/tag/v6.14.0)**
- *2017.05.15*, **[v6.13.0](//github.com/coderaiser/cloudcmd/releases/tag/v6.13.0)**
- *2017.05.12*, **[v6.12.0](//github.com/coderaiser/cloudcmd/releases/tag/v6.12.0)**
- *2017.05.10*, **[v6.11.0](//github.com/coderaiser/cloudcmd/releases/tag/v6.11.0)**
- *2017.04.25*, **[v6.10.1](//github.com/coderaiser/cloudcmd/releases/tag/v6.10.1)**
- *2017.04.24*, **[v6.10.0](//github.com/coderaiser/cloudcmd/releases/tag/v6.10.0)**
- *2017.04.18*, **[v6.9.3](//github.com/coderaiser/cloudcmd/releases/tag/v6.9.3)**
- *2017.04.13*, **[v6.9.2](//github.com/coderaiser/cloudcmd/releases/tag/v6.9.2)**
- *2017.04.12*, **[v6.9.1](//github.com/coderaiser/cloudcmd/releases/tag/v6.9.1)**
- *2017.03.23*, **[v6.9.0](//github.com/coderaiser/cloudcmd/releases/tag/v6.9.0)**
- *2017.03.21*, **[v6.8.1](//github.com/coderaiser/cloudcmd/releases/tag/v6.8.1)**
- *2017.03.06*, **[v6.8.0](//github.com/coderaiser/cloudcmd/releases/tag/v6.8.0)**
- *2017.03.04*, **[v6.7.0](//github.com/coderaiser/cloudcmd/releases/tag/v6.7.0)**
- *2017.02.24*, **[v6.6.3](//github.com/coderaiser/cloudcmd/releases/tag/v6.6.3)**
- *2017.02.24*, **[v6.6.2](//github.com/coderaiser/cloudcmd/releases/tag/v6.6.2)**
- *2017.02.24*, **[v6.6.1](//github.com/coderaiser/cloudcmd/releases/tag/v6.6.1)**
- *2017.02.22*, **[v6.6.0](//github.com/coderaiser/cloudcmd/releases/tag/v6.6.0)**
- *2017.02.21*, **[v6.5.6](//github.com/coderaiser/cloudcmd/releases/tag/v6.5.6)**
- *2017.02.21*, **[v6.5.5](//github.com/coderaiser/cloudcmd/releases/tag/v6.5.5)**
- *2017.02.17*, **[v6.5.4](//github.com/coderaiser/cloudcmd/releases/tag/v6.5.4)**
- *2017.02.17*, **[v6.5.3](//github.com/coderaiser/cloudcmd/releases/tag/v6.5.3)**
- *2017.02.15*, **[v6.5.2](//github.com/coderaiser/cloudcmd/releases/tag/v6.5.2)**
- *2017.02.14*, **[v6.5.1](//github.com/coderaiser/cloudcmd/releases/tag/v6.5.1)**
- *2017.02.14*, **[v6.5.0](//github.com/coderaiser/cloudcmd/releases/tag/v6.5.0)**
- *2017.02.06*, **[v6.4.0](//github.com/coderaiser/cloudcmd/releases/tag/v6.4.0)**
- *2017.02.02*, **[v6.3.1](//github.com/coderaiser/cloudcmd/releases/tag/v6.3.1)**
- *2017.01.27*, **[v6.3.0](//github.com/coderaiser/cloudcmd/releases/tag/v6.3.0)**
- *2017.01.26*, **[v6.2.2](//github.com/coderaiser/cloudcmd/releases/tag/v6.2.2)**
- *2017.01.24*, **[v6.2.1](//github.com/coderaiser/cloudcmd/releases/tag/v6.2.1)**
- *2017.01.24*, **[v6.2.0](//github.com/coderaiser/cloudcmd/releases/tag/v6.2.0)**
- *2017.01.20*, **[v6.1.0](//github.com/coderaiser/cloudcmd/releases/tag/v6.1.0)**
- *2017.01.17*, **[v6.0.3](//github.com/coderaiser/cloudcmd/releases/tag/v6.0.3)**
- *2017.01.08*, **[v6.0.2](//github.com/coderaiser/cloudcmd/releases/tag/v6.0.2)**
- *2017.01.06*, **[v6.0.1](//github.com/coderaiser/cloudcmd/releases/tag/v6.0.1)**
- *2016.12.29*, **[v6.0.0](//github.com/coderaiser/cloudcmd/releases/tag/v6.0.0)**
- *2016.12.27*, **[v5.13.0](//github.com/coderaiser/cloudcmd/releases/tag/v5.13.0)**
- *2016.12.23*, **[v5.12.4](//github.com/coderaiser/cloudcmd/releases/tag/v5.12.4)**
- *2016.12.23*, **[v5.12.3](//github.com/coderaiser/cloudcmd/releases/tag/v5.12.3)**
- *2016.12.19*, **[v5.12.2](//github.com/coderaiser/cloudcmd/releases/tag/v5.12.2)**
- *2016.12.19*, **[v5.12.1](//github.com/coderaiser/cloudcmd/releases/tag/v5.12.1)**
- *2016.12.16*, **[v5.12.0](//github.com/coderaiser/cloudcmd/releases/tag/v5.12.0)**
- *2016.12.05*, **[v5.11.1](//github.com/coderaiser/cloudcmd/releases/tag/v5.11.1)**
- *2016.12.01*, **[v5.10.2](//github.com/coderaiser/cloudcmd/releases/tag/v5.11.0)**
- *2016.12.01*, **[v5.10.2](//github.com/coderaiser/cloudcmd/releases/tag/v5.10.2)**
- *2016.11.22*, **[v5.10.1](//github.com/coderaiser/cloudcmd/releases/tag/v5.10.1)**
- *2016.11.18*, **[v5.10.0](//github.com/coderaiser/cloudcmd/releases/tag/v5.10.0)**
- *2016.11.10*, **[v5.9.1](//github.com/coderaiser/cloudcmd/releases/tag/v5.9.1)**
- *2016.11.10*, **[v5.9.0](//github.com/coderaiser/cloudcmd/releases/tag/v5.9.0)**
- *2016.11.09*, **[v5.8.0](//github.com/coderaiser/cloudcmd/releases/tag/v5.8.0)**
- *2016.11.06*, **[v5.7.6](//github.com/coderaiser/cloudcmd/releases/tag/v5.7.6)**
- *2016.11.06*, **[v5.7.5](//github.com/coderaiser/cloudcmd/releases/tag/v5.7.5)**
- *2016.10.27*, **[v5.7.4](//github.com/coderaiser/cloudcmd/releases/tag/v5.7.4)**
- *2016.10.27*, **[v5.7.3](//github.com/coderaiser/cloudcmd/releases/tag/v5.7.3)**
- *2016.10.24*, **[v5.7.2](//github.com/coderaiser/cloudcmd/releases/tag/v5.7.2)**
- *2016.10.24*, **[v5.7.1](//github.com/coderaiser/cloudcmd/releases/tag/v5.7.1)**
- *2016.10.18*, **[v5.7.0](//github.com/coderaiser/cloudcmd/releases/tag/v5.7.0)**
- *2016.09.22*, **[v5.6.2](//github.com/coderaiser/cloudcmd/releases/tag/v5.6.2)**
- *2016.09.06*, **[v5.6.1](//github.com/coderaiser/cloudcmd/releases/tag/v5.6.1)**
- *2016.07.19*, **[v5.6.0](//github.com/coderaiser/cloudcmd/releases/tag/v5.6.0)**
- *2016.06.29*, **[v5.5.1](//github.com/coderaiser/cloudcmd/releases/tag/v5.5.1)**
- *2016.06.15*, **[v5.5.0](//github.com/coderaiser/cloudcmd/releases/tag/v5.5.0)**
- *2016.06.10*, **[v5.4.3](//github.com/coderaiser/cloudcmd/releases/tag/v5.4.3)**
- *2016.06.09*, **[v5.4.2](//github.com/coderaiser/cloudcmd/releases/tag/v5.4.2)**
- *2016.05.25*, **[v5.4.1](//github.com/coderaiser/cloudcmd/releases/tag/v5.4.1)**
- *2016.05.15*, **[v5.4.0](//github.com/coderaiser/cloudcmd/releases/tag/v5.4.0)**
- *2016.05.11*, **[v5.3.2](//github.com/coderaiser/cloudcmd/releases/tag/v5.3.2)**
- *2016.03.28*, **[v5.3.1](//github.com/coderaiser/cloudcmd/releases/tag/v5.3.1)**
- *2016.03.28*, **[v5.3.0](//github.com/coderaiser/cloudcmd/releases/tag/v5.3.0)**
- *2016.03.18*, **[v5.2.3](//github.com/coderaiser/cloudcmd/releases/tag/v5.2.3)**
- *2016.03.10*, **[v5.2.2](//github.com/coderaiser/cloudcmd/releases/tag/v5.2.2)**
- *2016.03.07*, **[v5.2.1](//github.com/coderaiser/cloudcmd/releases/tag/v5.2.1)**
- *2016.03.05*, **[v5.2.0](//github.com/coderaiser/cloudcmd/releases/tag/v5.2.0)**
- *2016.02.26*, **[v5.1.5](//github.com/coderaiser/cloudcmd/releases/tag/v5.1.5)**
- *2016.02.25*, **[v5.1.4](//github.com/coderaiser/cloudcmd/releases/tag/v5.1.4)**
- *2016.02.24*, **[v5.1.3](//github.com/coderaiser/cloudcmd/releases/tag/v5.1.3)**
- *2016.02.21*, **[v5.1.2](//github.com/coderaiser/cloudcmd/releases/tag/v5.1.2)**
- *2016.02.21*, **[v5.1.1](//github.com/coderaiser/cloudcmd/releases/tag/v5.1.1)**
- *2016.02.20*, **[v5.1.0](//github.com/coderaiser/cloudcmd/releases/tag/v5.1.0)**
- *2016.02.13*, **[v5.0.15](//github.com/coderaiser/cloudcmd/releases/tag/v5.0.15)**
- *2016.02.10*, **[v5.0.14](//github.com/coderaiser/cloudcmd/releases/tag/v5.0.14)**
- *2016.02.10*, **[v5.0.13](//github.com/coderaiser/cloudcmd/releases/tag/v5.0.13)**
- *2016.02.10*, **[v5.0.12](//github.com/coderaiser/cloudcmd/releases/tag/v5.0.12)**
- *2016.02.06*, **[v5.0.11](//github.com/coderaiser/cloudcmd/releases/tag/v5.0.11)**
- *2016.02.04*, **[v5.0.10](//github.com/coderaiser/cloudcmd/releases/tag/v5.0.10)**
- *2016.02.02*, **[v5.0.9](//github.com/coderaiser/cloudcmd/releases/tag/v5.0.9)**
- *2016.02.01*, **[v5.0.8](//github.com/coderaiser/cloudcmd/releases/tag/v5.0.8)**
- *2016.01.20*, **[v5.0.7](//github.com/coderaiser/cloudcmd/releases/tag/v5.0.7)**
- *2016.01.15*, **[v5.0.6](//github.com/coderaiser/cloudcmd/releases/tag/v5.0.6)**
- *2016.01.11*, **[v5.0.5](//github.com/coderaiser/cloudcmd/releases/tag/v5.0.5)**
- *2015.12.26*, **[v5.0.4](//github.com/coderaiser/cloudcmd/releases/tag/v5.0.4)**
- *2015.12.08*, **[v5.0.3](//github.com/coderaiser/cloudcmd/releases/tag/v5.0.3)**
- *2015.12.01*, **[v5.0.2](//github.com/coderaiser/cloudcmd/releases/tag/v5.0.2)**
- *2015.11.15*, **[v5.0.1](//github.com/coderaiser/cloudcmd/releases/tag/v5.0.1)**
- *2015.11.15*, **[v5.0.0](//github.com/coderaiser/cloudcmd/releases/tag/v5.0.0)**
- *2015.11.11*, **[v4.7.7](//github.com/coderaiser/cloudcmd/releases/tag/v4.7.7)**
- *2015.11.06*, **[v4.7.6](//github.com/coderaiser/cloudcmd/releases/tag/v4.7.6)**
- *2015.10.29*, **[v4.7.5](//github.com/coderaiser/cloudcmd/releases/tag/v4.7.5)**
- *2015.10.27*, **[v4.7.4](//github.com/coderaiser/cloudcmd/releases/tag/v4.7.4)**
- *2015.10.24*, **[v4.7.3](//github.com/coderaiser/cloudcmd/releases/tag/v4.7.3)**
- *2015.10.14*, **[v4.7.2](//github.com/coderaiser/cloudcmd/releases/tag/v4.7.2)**
- *2015.10.14*, **[v4.7.1](//github.com/coderaiser/cloudcmd/releases/tag/v4.7.1)**
- *2015.10.05*, **[v4.7.0](//github.com/coderaiser/cloudcmd/releases/tag/v4.7.0)**
- *2015.09.28*, **[v4.6.0](//github.com/coderaiser/cloudcmd/releases/tag/v4.6.0)**
- *2015.09.27*, **[v4.5.7](//github.com/coderaiser/cloudcmd/releases/tag/v4.5.7)**
- *2015.09.24*, **[v4.5.6](//github.com/coderaiser/cloudcmd/releases/tag/v4.5.6)**
- *2015.09.23*, **[v4.5.5](//github.com/coderaiser/cloudcmd/releases/tag/v4.5.5)**
- *2015.09.22*, **[v4.5.4](//github.com/coderaiser/cloudcmd/releases/tag/v4.5.4)**
- *2015.09.16*, **[v4.5.3](//github.com/coderaiser/cloudcmd/releases/tag/v4.5.3)**
- *2015.09.03*, **[v4.5.2](//github.com/coderaiser/cloudcmd/releases/tag/v4.5.2)**
- *2015.08.28*, **[v4.5.1](//github.com/coderaiser/cloudcmd/releases/tag/v4.5.1)**
- *2015.08.26*, **[v4.5.0](//github.com/coderaiser/cloudcmd/releases/tag/v4.5.0)**
- *2015.08.25*, **[v4.4.0](//github.com/coderaiser/cloudcmd/releases/tag/v4.4.0)**
- *2015.08.21*, **[v4.3.5](//github.com/coderaiser/cloudcmd/releases/tag/v4.3.5)**
- *2015.08.19*, **[v4.3.4](//github.com/coderaiser/cloudcmd/releases/tag/v4.3.4)**
- *2015.08.17*, **[v4.3.3](//github.com/coderaiser/cloudcmd/releases/tag/v4.3.3)**
- *2015.08.17*, **[v4.3.2](//github.com/coderaiser/cloudcmd/releases/tag/v4.3.2)**
- *2015.08.13*, **[v4.3.1](//github.com/coderaiser/cloudcmd/releases/tag/v4.3.1)**
- *2015.08.11*, **[v4.3.0](//github.com/coderaiser/cloudcmd/releases/tag/v4.3.0)**
- *2015.07.24*, **[v4.2.0](//github.com/coderaiser/cloudcmd/releases/tag/v4.2.0)**
- *2015.07.23*, **[v4.1.2](//github.com/coderaiser/cloudcmd/releases/tag/v4.1.2)**
- *2015.07.23*, **[v4.1.1](//github.com/coderaiser/cloudcmd/releases/tag/v4.1.1)**
- *2015.07.21*, **[v4.1.0](//github.com/coderaiser/cloudcmd/releases/tag/v4.1.0)**
- *2015.07.13*, **[v4.0.0](//github.com/coderaiser/cloudcmd/releases/tag/v4.0.0)**
- *2015.07.09*, **[v3.8.1](//github.com/coderaiser/cloudcmd/releases/tag/v3.8.1)**
- *2015.07.06*, **[v3.8.0](//github.com/coderaiser/cloudcmd/releases/tag/v3.8.0)**
- *2015.07.04*, **[v3.7.2](//github.com/coderaiser/cloudcmd/releases/tag/v3.7.2)**
- *2015.07.04*, **[v3.7.1](//github.com/coderaiser/cloudcmd/releases/tag/v3.7.1)**
- *2015.07.03*, **[v3.7.0](//github.com/coderaiser/cloudcmd/releases/tag/v3.7.0)**
- *2015.07.01*, **[v3.6.0](//github.com/coderaiser/cloudcmd/releases/tag/v3.6.0)**
- *2015.06.27*, **[v3.5.0](//github.com/coderaiser/cloudcmd/releases/tag/v3.5.0)**
- *2015.06.22*, **[v3.4.0](//github.com/coderaiser/cloudcmd/releases/tag/v3.4.0)**
- *2015.06.20*, **[v3.3.0](//github.com/coderaiser/cloudcmd/releases/tag/v3.3.0)**
- *2015.06.12*, **[v3.2.0](//github.com/coderaiser/cloudcmd/releases/tag/v3.2.0)**
- *2015.06.11*, **[v3.1.4](//github.com/coderaiser/cloudcmd/releases/tag/v3.1.4)**
- *2015.06.11*, **[v3.1.3](//github.com/coderaiser/cloudcmd/releases/tag/v3.1.3)**
- *2015.06.10*, **[v3.1.2](//github.com/coderaiser/cloudcmd/releases/tag/v3.1.2)**
- *2015.06.09*, **[v3.1.1](//github.com/coderaiser/cloudcmd/releases/tag/v3.1.1)**
- *2015.06.09*, **[v3.1.0](//github.com/coderaiser/cloudcmd/releases/tag/v3.1.0)**
- *2015.06.04*, **[v3.0.4](//github.com/coderaiser/cloudcmd/releases/tag/v3.0.4)**
- *2015.06.02*, **[v3.0.3](//github.com/coderaiser/cloudcmd/releases/tag/v3.0.3)**
- *2015.05.31*, **[v3.0.2](//github.com/coderaiser/cloudcmd/releases/tag/v3.0.2)**
- *2015.05.29*, **[v3.0.1](//github.com/coderaiser/cloudcmd/releases/tag/v3.0.1)**
- *2015.05.28*, **[v3.0.0](//github.com/coderaiser/cloudcmd/releases/tag/v3.0.0)**
- *2015.05.22*, **[v2.9.3](//github.com/coderaiser/cloudcmd/releases/tag/v2.9.3)**
- *2015.05.22*, **[v2.9.2](//github.com/coderaiser/cloudcmd/releases/tag/v2.9.2)**
- *2015.05.19*, **[v2.9.1](//github.com/coderaiser/cloudcmd/releases/tag/v2.9.1)**
- *2015.05.15*, **[v2.9.0](//github.com/coderaiser/cloudcmd/releases/tag/v2.9.0)**
- *2015.05.14*, **[v2.8.0](//github.com/coderaiser/cloudcmd/releases/tag/v2.8.0)**
- *2015.04.24*, **[v2.7.1](//github.com/coderaiser/cloudcmd/releases/tag/v2.7.1)**
- *2015.04.24*, **[v2.7.0](//github.com/coderaiser/cloudcmd/releases/tag/v2.7.0)**
- *2015.04.17*, **[v2.6.0](//github.com/coderaiser/cloudcmd/releases/tag/v2.6.0)**
- *2015.04.14*, **[v2.5.1](//github.com/coderaiser/cloudcmd/releases/tag/v2.5.1)**
- *2015.04.09*, **[v2.5.0](//github.com/coderaiser/cloudcmd/releases/tag/v2.5.0)**
- *2015.04.03*, **[v2.4.2](//github.com/coderaiser/cloudcmd/releases/tag/v2.4.2)**
- *2015.03.28*, **[v2.4.1](//github.com/coderaiser/cloudcmd/releases/tag/v2.4.1)**
- *2015.03.28*, **[v2.4.0](//github.com/coderaiser/cloudcmd/releases/tag/v2.4.0)**
- *2015.03.26*, **[v2.3.1](//github.com/coderaiser/cloudcmd/releases/tag/v2.3.1)**
- *2015.03.26*, **[v2.3.0](//github.com/coderaiser/cloudcmd/releases/tag/v2.3.0)**
- *2015.03.19*, **[v2.2.1](//github.com/coderaiser/cloudcmd/releases/tag/v2.2.1)**
- *2015.03.13*, **[v2.2.0](//github.com/coderaiser/cloudcmd/releases/tag/v2.2.0)**
- *2015.02.02*, **[v2.1.0](//github.com/coderaiser/cloudcmd/releases/tag/v2.1.0)**
- *2014.12.09*, **[v2.0.0](//github.com/coderaiser/cloudcmd/releases/tag/v2.0.0)**
- *2014.11.21*, **[v1.5.1](//github.com/coderaiser/cloudcmd/releases/tag/v1.5.1)**
- *2014.11.19*, **[v1.5.0](//github.com/coderaiser/cloudcmd/releases/tag/v1.5.0)**
- *2014.11.05*, **[v1.4.1](//github.com/coderaiser/cloudcmd/releases/tag/v1.4.1)**
- *2014.10.28*, **[v1.4.0](//github.com/coderaiser/cloudcmd/releases/tag/v1.4.0)**
- *2014.10.02*, **[v1.3.2](//github.com/coderaiser/cloudcmd/releases/tag/v1.3.2)**
- *2014.09.22*, **[v1.3.1](//github.com/coderaiser/cloudcmd/releases/tag/v1.3.1)**
- *2014.09.18*, **[v1.3.0](//github.com/coderaiser/cloudcmd/releases/tag/v1.3.0)**
- *2014.08.29*, **[v1.2.0](//github.com/coderaiser/cloudcmd/releases/tag/v1.2.0)**
- *2014.07.18*, **[v1.1.1](//github.com/coderaiser/cloudcmd/releases/tag/v1.1.1)**
- *2014.07.10*, **[v1.1.0](//github.com/coderaiser/cloudcmd/releases/tag/v1.1.0)**
- *2014.07.03*, **[v1.0.0](//github.com/coderaiser/cloudcmd/releases/tag/v1.0.0)**
- *2014.06.16*, **[v0.9.2](//github.com/coderaiser/cloudcmd/releases/tag/v0.9.2)**
- *2014.06.11*, **[v0.9.1](//github.com/coderaiser/cloudcmd/releases/tag/v0.9.1)**
- *2014.06.10*, **[v0.9.0](//github.com/coderaiser/cloudcmd/releases/tag/v0.9.0)**
- *2014.04.28*, **[v0.8.4](//github.com/coderaiser/cloudcmd/releases/tag/v0.8.4)**
- *2014.03.19*, **[v0.8.3](//github.com/coderaiser/cloudcmd/releases/tag/v0.8.3)**
- *2014.03.03*, **[v0.8.2](//github.com/coderaiser/cloudcmd/releases/tag/v0.8.2)**
- *2014.02.13*, **[v0.8.1](//github.com/coderaiser/cloudcmd/releases/tag/v0.8.1)**
- *2014.02.13*, **[v0.8.0](//github.com/coderaiser/cloudcmd/releases/tag/v0.8.0)**
- *2013.12.09*, **[v0.7.0](//github.com/coderaiser/cloudcmd/releases/tag/v0.7.0)**
- *2013.11.08*, **[v0.6.0](//github.com/coderaiser/cloudcmd/releases/tag/v0.6.0)**
- *2013.10.17*, **[v0.5.0](//github.com/coderaiser/cloudcmd/releases/tag/v0.5.0)**
- *2013.09.27*, **[v0.4.0](//github.com/coderaiser/cloudcmd/releases/tag/v0.4.0)**
- *2013.08.01*, **[v0.3.0](//github.com/coderaiser/cloudcmd/releases/tag/v0.3.0)**
- *2013.04.22*, **[v0.2.0](//github.com/cloudcmd/archive/raw/master/cloudcmd-v0.2.0.zip)**
- *2013.03.01*, **[v0.1.9](//github.com/cloudcmd/archive/raw/master/cloudcmd-v0.1.9.zip)**
- *2012.12.12*, **[v0.1.8](//github.com/cloudcmd/archive/raw/master/cloudcmd-v0.1.8.zip)**
- *2012.10.01*, **[v0.1.7](//github.com/cloudcmd/archive/raw/master/cloudcmd-v0.1.7.zip)**
- *2012.08.24*, **[v0.1.6](//github.com/cloudcmd/archive/raw/master/cloudcmd-v0.1.6.zip)**
- *2012.08.06*, **[v0.1.5](//github.com/cloudcmd/archive/raw/master/cloudcmd-v0.1.5.zip)**
- *2012.07.27*, **[v0.1.4](//github.com/cloudcmd/archive/raw/master/cloudcmd-v0.1.4.zip)**
- *2012.07.19*, **[v0.1.3](//github.com/cloudcmd/archive/raw/master/cloudcmd-v0.1.3.zip)**
- *2012.07.14*, **[v0.1.2](//github.com/cloudcmd/archive/raw/master/cloudcmd-v0.1.2.zip)**
- *2012.07.11*, **[v0.1.1](//github.com/cloudcmd/archive/raw/master/cloudcmd-v0.1.1.zip)**
- *2012.07.09*, **[v0.1.0](//github.com/cloudcmd/archive/raw/master/cloudcmd-v0.1.0.zip)**

Special Thanks
---------------
- [Olena Zalitok](https://zalitok.github.io/ "Olena Zalitok") for **logo** and **favicon**.
- [TarZak](https://github.com/tarzak "TarZak")
    - Russian and Ukrainian translations;
    - config template and style;
    - change order of directories and files;
    - add ability do not hide path and header when files are scrolling;

