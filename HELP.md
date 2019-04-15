# Cloud Commander v12.1.0

### [Main][MainURL] [Blog][BlogURL] Live(![Heroku][Heroku_LIVE_IMG] [Heroku][HerokuURL], ![Now][NOW_LIVE_IMG] [Now][NowURL])

[MainURL]:                  http://cloudcmd.io "Main"
[BlogURL]:                  http://blog.cloudcmd.io "Blog"
[HerokuURL]:                https://cloudcmd.herokuapp.com/ "Heroku"
[NowURL]:                   https://cloudcmd.now.sh/ "Now"
[HEROKU_LIVE_IMG]:          https://status.cloudcmd.io/host/cloudcmd.herokuapp.com/img/file.png "Heroku"
[NOW_LIVE_IMG]:             https://status.cloudcmd.io/host/cloudcmd.now.sh/img/file.png "Now"

[DWORD]:                    https://github.com/cloudcmd/dword "Editor based on CodeMirror"
[EDWARD]:                   https://github.com/cloudcmd/edward "Editor based on Ace"
[DEEPWORD]:                 https://github.com/cloudcmd/deepword "Editor based on Monaco"
[EDWARD_KEYS]:              https://github.com/cloudcmd/edward/#hot-keys "Edward Hot keys"
[TERMUX]:                   https://termux.com "Termux"
[INLY]:                     https://github.com/coderaiser/node-inly "Extract archive"

**Cloud Commander** is a file manager for the web. It includes a command-line console and a text editor. Cloud Commander helps you manage your server and work with files, directories and programs in a web browser from any computer, mobile or tablet.

![Cloud Commander](/img/logo/cloudcmd.png "Cloud Commander")

Benefits
---------------

- Open source (**MIT License**).
- Has 2 classic panels.
- Optional **authorization**.
- Client works in a web browser.
- Server works on **Windows**, **Linux**, **Mac OS** and **Android** (with help of [Termux][TERMUX]).
- Can be used local or remotely.
- Adapts to screen size.
- **3 built-in editors** with support of **syntax highlighting**: [Dword][DWORD], [Edward][EDWARD] and [Deepword][DEEPWORD].
- [Console](https://github.com/cloudcmd/console "Console") with support of the default OS command line.
- Written in **JavaScript/Node.js**.
- Built-in archives pack: **zip** and **tar.gz**.
- Built-in archives extract: **zip**, **tar**, **gz**, **bz2**, **.tar.gz** and **.tar.bz2** (with help of [inly][INLY]).

Installation
---------------

Installation is very simple:

- Install the latest version of [node.js](https://nodejs.org/ "node.js").
- Install `cloudcmd` via `npm` with:

```sh
npm i cloudcmd -g
```

When in trouble, use:

```sh
npm i cloudcmd -g --force
```

Usage
---------------
To start the server, just run the global *npm* binary from your terminal:

```sh
cloudcmd
```

Cloud Commander supports the following command-line parameters:

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
| `--show-file-name`            | show file name in view and edit
| `--editor`                    | set editor: "dword", "edward" or "deepword"
| `--packer`                    | set packer: "tar" or "zip"
| `--root`                      | set root directory
| `--prefix`                    | set url prefix
| `--prefix-socket`             | set prefix for url connection
| `--port`                      | set port number
| `--progress`                  | show progress of file operations
| `--confirm-copy`              | confirm copy
| `--confirm-move`              | confirm move
| `--open`                      | open web browser when server starts
| `--name`                      | set tab name in web browser
| `--one-file-panel`            | show one file panel
| `--keys-panel`                | show keys panel
| `--contact`                   | enable contact
| `--config-dialog`             | enable config dialog
| `--config-auth`               | enable auth change in config dialog
| `--console`                   | enable console
| `--sync-console-path`         | sync console path
| `--terminal`                  | enable terminal
| `--terminal-path`             | set terminal path
| `--terminal-command`          | set command to run in terminal (shell by default)
| `--terminal-auto-restart`     | restart command on exit
| `--vim`                       | enable vim hot keys
| `--columns`                   | set visible columns
| `--export`                    | enable export of config through a server
| `--export-token`              | authorization token used by export server
| `--import`                    | enable import of config
| `--import-token`              | authorization  token used to connect to export server
| `--import-url`                | url of an import server
| `--import-listen`             | enable listen on config updates from import server
| `--dropbox`                   | enable dropbox integration
| `--dropbox-token`             | set dropbox token
| `--log`                       | enable logging
| `--no-show-config`            | do not show config values
| `--no-server`                 | do not start server
| `--no-auth`                   | disable authorization
| `--no-online`                 | load scripts from local server
| `--no-open`                   | do not open web browser when server started
| `--no-name`                   | set default tab name in web browser
| `--no-keys-panel`             | hide keys panel
| `--no-one-file-panel`         | show two file panels
| `--no-progress`               | do not show progress of file operations
| `--no-confirm-copy`           | do not confirm copy
| `--no-confirm-move`           | do not confirm move
| `--no-config-dialog`          | disable config dialog
| `--no-config-auth`            | disable auth change in config dialog
| `--no-console`                | disable console
| `--no-sync-console-path`      | do not sync console path
| `--no-contact`                | disable contact
| `--no-terminal`               | disable terminal
| `--no-terminal-command`       | set default shell to run in terminal
| `--no-terminal-auto-restart`  | do not restart command on exit
| `--no-vim`                    | disable vim hot keys
| `--no-columns`                | set default visible columns
| `--no-export`                 | disable export config through a server
| `--no-import`                 | disable import of config
| `--no-import-listen`          | disable listen on config updates from import server
| `--no-show-file-name`         | do not show file name in view and edit
| `--no-dropbox`                | disable dropbox integration
| `--no-dropbox-token`          | unset dropbox token
| `--no-log`                    | disable logging

For options not specified by command-line parameters, Cloud Commander then reads configuration data from `~/.cloudcmd.json`. It uses port `8000` by default.

To begin using the web client, go to this URL in your browser:

```
http://localhost:8000
```

Updating the app
---------------
If you installed Cloud Commander with `npm`, stop the server. Then, reinstall it with:

```sh
npm install cloudcmd -g
```

Then, start the server again with `cloudcmd` and reload the page.

Hot keys
---------------

|Key                    |Operation
|:----------------------|:--------------------------------------------
| `F1`                  | help
| `F2`                  | rename
| `F3`                  | view, change directory
| `Shift + F3`          | view as markdown
| `F4`                  | edit
| `Shift + F4`          | edit in "vim" mode
| `F5`                  | copy
| `Alt` + `F5`          | pack
| `F6`                  | rename/move
| `F7`                  | new directory
| `Shift + F7`          | new file
| `F8`, `Delete`        | remove
| `Shift + Delete`      | remove without prompt
| `F9`                  | menu
| `Alt` + `F9`          | extract
| `F10`                 | config
| `*`                   | select/unselect all
| `+`                   | expand selection
| `-`                   | shrink selection
| `Ctrl + X`            | cut to buffer
| `Ctrl + C`            | copy to buffer
| `Ctrl + V`            | paste from buffer
| `Ctrl + Z`            | clear buffer
| `Ctrl + P`            | copy path
| `Ctrl + R`            | refresh
| `Ctrl + D`            | clear local storage
| `Ctrl + A`            | select all files in a panel
| `Ctrl + M`            | [rename selected files](https://github.com/coderaiser/cloudcmd/releases/tag/v12.0.0) in editor
| `Shift + Ctrl + M`    | rename selected files in vim mode of editor
| `Ctrl + U`            | swap panels
| `Ctrl + F3`           | sort by name
| `Ctrl + F5`           | sort by date
| `Ctrl + F6`           | sort by size
| `Up`, `Down`          | file system navigation
| `Enter`               | change directory/view file
| `Alt + Left/Right`    | show content of directory under cursor in target panel
| `Alt + G`             | go to directory
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

### Vim

When the `--vim` option is provided, or the configuration parameter `vim` is set, the following hotkeys become available:

|Key                    |Operation
|:----------------------|:--------------------------------------------
| `j`                   | navigate to next file
| `k`                   | navigate to previous file
| `dd`                  | remove current file
| `G`                   | navigate to bottom file
| `gg`                  | navigate to top file
| `v`                   | visual mode
| `y`                   | copy (selected in visual mode files)
| `p`                   | paste files
| `Esc`                 | unselect all
| `/`                   | find file in current directory
| `n`                   | navigate to next found file
| `N`                   | navigate to previous found file

Commands can be joined, for example:
- `5j` will navigate **5** files below current;
- `d5j` will remove next **5** files;
- `dG` will remove all files from current to bottom;

Drag and drop
---------------
These file operations are accessible with "drag and drop".

| Drag Mouse Button | Key       | Origin    | Destination   |Operation
|:------------------|:----------|:----------|:--------------|:------------------
| Left              |           | Panel     | Panel         | copy files
| Left              | `Shift`   | Panel     | Panel         | rename/move files
| Left              |           | Panel     | Desktop       | download files
| Left              |           | Desktop   | Panel         | upload files

View
---------------
![View](/img/screen/view.png "View")

### Features
- View images.
- View text files.
- Play audio.
- Play video.

### Hotkeys

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
| `Shift + F4`          | open in "vim" mode
| `Esc`                 | close

For more details see [Edward hotkeys][EDWARD_KEYS].

Console
---------------
![Console](/img/screen/console.png "Console")

### Hot keys

|Key                    |Operation
|:----------------------|:--------------------------------------------
| `~`                   | open
| `Ctrl + P`            | paste path of current directory
| `Esc`                 | close

For more details see [console hot keys](https://github.com/cloudcmd/console#hot-keys "Console Hot Keys").

Terminal
---------------
![Terminal](/img/screen/terminal.png "Terminal")

### Install

The terminal is disabled and not installed by default. To use it, you should install [gritty](https://github.com/cloudcmd/gritty "Gritty") with:

```sh
npm i gritty -g
```

and then set the path for the terminal with:

```sh
cloudcmd --terminal --terminal-path `gritty --path` --save
```

### Windows

If you can't install `gritty` on Windows, try to install `windows-build-tools` first:

```sh
npm install windows-build-tools -g
```

Then get the path of `gritty` with:

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

After that, you can use Cloud Commander's terminal in the same way as a normal shell console.

### Hotkeys

|Key                    |Operation
|:----------------------|:--------------------------------------------
| `Shift` + `~`         | open
| `Shift` + `Esc`       | close

Environment Variables
---------------

Every program executed in Cloud Commander's terminal has these environment variables:

- `ACTIVE_DIR` - directory that contains cursor
- `PASSIVE_DIR` - directory with no cursor
- `CURRENT_NAME` - name of a file under cursor
- `CURRENT_PATH` - path to file under cursor

On Unix, you can use it this way:

```sh
~> echo $CURRENT_PATH
/home/coderaiser/cloudcmd/bin/cloudcmd.js
```

Configuration
---------------
![Config](/img/screen/config.png "Config")

### Hot keys

|Key                    |Operation
|:----------------------|:--------------------------------------------
| `F10`                 | open
| `Esc`                 | close

When you change any options, the `~/.cloudcmd.json` file is automatically updated.
It can also be edited manually with any text editor.
Here's a description of all options:

```js
{
    "name"                  : "",       // set tab name in web browser
    "auth"                  : false,    // enable http authentication
    "username"              : "root",   // username for authentication
    "password"              : "toor",   // password hash for authentication
    "algo"                  : "sha512WithRSAEncryption", // cryptographic algorithm
    "editor"                : "edward", // default, could be "dword" or "edward"
    "packer"                : "tar",    // default, could be "tar" or "zip"
    "diff"                  : true,     // when save - send patch, not whole file
    "zip"                   : true,     // zip text before send / unzip before save
    "buffer"                : true,     // buffer for copying files
    "dirStorage"            : true,     // store directory listing
    "online"                : false,    // do not load js files from cdn
    "open"                  : true,     // open web browser when server started
    "oneFilePanel"          : false,    // show one file panel
    "keysPanel"             : true,     // show classic panel with buttons of keys
    "port"                  : 8000,     // http port
    "ip"                    : null,     // ip or null(default)
    "root"                  : "/",      // root directory
    "prefix"                : "",       // url prefix
    "prefixSocket"          : "",       // prefix for socket connection
    "progress"              : true,     // show progress of file operations
    "confirmCopy"           : true,     // confirm copy
    "confirmMove"           : true,     // confirm move
    "showConfig"            : false,    // show config at startup
    "showFileName"          : false     // do not show file name in view and edit
    "contact"               : true,     // enable contact
    "configDialog"          : true,     // enable config dialog
    "configAuth"            : true,     // enable auth change in config dialog
    "console"               : true,     // enable console
    "syncConsolePath"       : false     // do not sync console path
    "terminal"              : false,    // disable terminal
    "terminalPath"          : '',       // path of a terminal
    "terminalCommand"       : '',       // set command to run in terminal
    "terminalAutoRestart"   : true,     // restart command on exit
    "vim"                   : false,    // disable vim hot keys
    "columns"               : "name-size-date-owner-mode", // set visible columns
    "export"                : false,    // enable export of config through a server
    "exportToken"           : "root",   // token used by export server
    "import"                : false,    // enable import of config 
    "import-url"            : "http://localhost:8000",   // url of an export server
    "importToken"           : "root",   // token used to connect to export server
    "importListen"          : false,    // listen on config updates
    "dropbox"               : false,    // disable dropbox integration
    "dropboxToken"          : "",       // unset dropbox token
    "log"                   : true      // logging
}
```

### Environment Variables

Some config options can be overridden with environment variables, such as:

- `CLOUDCMD_NAME` - set tab name in web browser
- `CLOUDCMD_OPEN` - open web browser when server started
- `CLOUDCMD_EDITOR` - set editor
- `CLOUDCMD_COLUMNS` - set visible columns 
- `CLOUDCMD_CONTACT` - enable contact
- `CLOUDCMD_CONFIG_DIALOG` - enable config dialog
- `CLOUDCMD_CONFIG_AUTH` - enable auth change in config dialog
- `CLOUDCMD_CONSOLE` - enable console
- `CLOUDCMD_SYNC_CONSOLE_PATH` - sync console path
- `CLOUDCMD_TERMINAL` - enable terminal
- `CLOUDCMD_TERMINAL_PATH` - set terminal path
- `CLOUDCMD_TERMINAL_COMMAND` - set command to run in terminal (shell by default)
- `CLOUDCMD_TERMINAL_AUTO_RESTART` - restart command on exit
- `CLOUDCMD_KEYS_PANEL` - show keys panel
- `CLOUDCMD_ONE_FILE_PANEL` - show one file panel
- `CLOUDCMD_AUTH` - enable authentication
- `CLOUDCMD_USERNAME` - set username
- `CLOUDCMD_PASSWORD` - set password
- `CLOUDCMD_ROOT` - set root directory
- `CLOUDCMD_VIM` - enable vim hot keys
- `CLOUDCMD_CONFIRM_COPY` - confirm copy
- `CLOUDCMD_CONFIRM_MOVE` - confirm move
- `CLOUDCMD_SHOW_FILE_NAME` - show file name in view and edit
- `CLOUDCMD_EXPORT` - enable export of config through a server
- `CLOUDCMD_EXPORT_TOKEN` - authorization token used by export server
- `CLOUDCMD_IMPORT` - enable import of config
- `CLOUDCMD_IMPORT_TOKEN` - authorization  token used to connect to export server
- `CLOUDCMD_IMPORT_URL` - url of an import server
- `CLOUDCMD_IMPORT_LISTEN`- enable listen on config updates from import server

### Distribute

Being able to configure Cloud Commander remotely opens the doors to using it as microservice, and that's what the "distribute" options set out to do.

There is an **export server** and an **import client**, which are enabled with `--export` and `--import` respectively. There is a "token", which should be the same in `--import-token` and `--export-token`. To use the *import client*, you should provide `--import-url` to the client so it can connect to an *export server*.

There are two ways that the *import client* can receive configuration from an *export server*:

- full config at startup (default)
- get every updated option (with help of the `--import-listen` flag)

#### An example - using the "distribute" options to get configuration from a remote instance:

Here's an *export server*:

```
coderaiser@cloudcmd:~$ cloudcmd --port 1234 --export --export-token=cloudcmd
```

...and an *import client*:

```
coderaiser@cloudcmd:~$ cloudcmd --name importer --port 4321 --import-url http://127.0.0.1:1234 --import-token=cloudcmd --no-server --save
```

Here's the log output from the *export server*:

```
url: http://localhost:1234/
2018.08.23 13:41:45 -> export: try to auth from importer [127.0.0.1:4321]
2018.08.23 13:41:45 -> export: connected to importer [127.0.0.1:4321]
2018.08.23 13:41:45 -> export: config send to importer[127.0.0.1:4321]
2018.08.23 13:41:45 -> export: disconnected importer [127.0.0.1:4321]
```

...and the log output from the *import client*:

```
2018.08.23 13:47:36 -> import: try to auth to http://127.0.0.1:1234
2018.08.23 13:47:36 -> import: connected to http://127.0.0.1:1234
2018.08.23 13:47:36 -> import: config received from http://127.0.0.1:1234
2018.08.23 13:47:36 -> import: disconnected from http://127.0.0.1:1234
```

When the *import client* uses `--import-listen`, a persistent connection is used, and the *client* receives live updates from the *import server*.

The *export server* omits the following configuration fields:

- `auth`
- `username`
- `password`
- `algo`
- `name`
- `ip`
- `port`
- `root`
- `import`
- `importUrl`
- `importToken`
- `export`
- `exportToken`
- `log`
- `configDialog`

Menu
---------------
![Menu](/img/screen/menu.png "Menu")

Right-mouse click to show a context menu with these items:

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

One file panel
---------------
Cloud Commander can work in one panel mode when your screen size can't accommodate a second panel (such as on mobile or tablet), or via the `--one-file-panel` options flag.

![One file panel](/img/screen/one-file-panel.png "One file panel")

Using as middleware
---------------

Cloud Commander can be used as middleware for `node.js` applications based on [socket.io](http://socket.io "Socket.IO") and [express](http://expressjs.com "Express"):

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
    path: `{prefix}socket.io`
});

const config = {
    name: 'cloudcmd :)'
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

Now you're ready to go!

### Authorization

If you want to enable authorization, you can pass credentials to Cloud Commander with a config. To generate a password, you can install `criton` with `npm i criton --save`, and use it (or any other way) to generate a hash of a password.

```js
const criton = require('criton');
const algo = 'sha512WithRSAEncryption'; // default

// you can generate a hash dynamically
const password = criton('root', algo);

// or use a pregenerated hash as well
'2b64f2e..ca5d9a9';

const auth = true;
const username = 'root';

const config = {
    algo, // optional
    auth,
    username,
    pasword,
}
```

Server
---------------
Standard practices dictate that no non-root process get to talk to the internet on a port less than 1024. Despite this, **I suggest you start Cloud Commander as a non-root process**. How can we get around this limitation? There's a couple of fast & easy ways. One of them is port forwarding:

### Iptables

Just run `shell/addtables.sh` for default options.

```sh
iptables -t nat -L # look rules before
iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-ports 8000
iptables -t nat -A PREROUTING -p tcp --dport 443 -j REDIRECT --to-ports 4430
iptables -t nat -L # look rules after
```

You should see something like this (**8000** and **4430** should be in config as **port** and **sslPort**)

```sh
target     prot opt source               destination
REDIRECT   tcp  --  anywhere             anywhere             tcp dpt:http redir ports 8000
REDIRECT   tcp  --  anywhere             anywhere             tcp dpt:https redir ports 4430
```
If you would want to get things back just clear rules (rule numbers **1** and **2**; in your list they could differ).

```sh
iptables -t nat -D PREROUTING 2
iptables -t nat -D PREROUTING 1
```

### nginx
Get [nginx](http://nginx.org/ "nginx"). On Linux, you can run:

```sh
sudo apt-get install nginx #for ubuntu and debian
```

Then, make a host file **/etc/nginx/sites-available/io.cloudcmd.io**
(where, for example, *io.cloudcmd.io* is your domain name) with these contents:

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

**If you want add SSL**, add a couple lines to the `server` block:

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

For WebSocket support, (nginx >= v1.3.13) modify the `server` block like so:

```sh
    location / {
        proxy_http_version  1.1;
        proxy_set_header    Upgrade $http_upgrade;
        proxy_set_header    Connection "upgrade";

        proxy_pass          http://127.0.0.1:8000/;
    }
```


If you need redirection from **http** to **https**, simply use:

```sh
server {
    listen 80;
    server_name admin.cloudcmd.io;
    rewrite ^ https://io.cloudcmd.io$request_uri? permanent; #301 redirect
    access_log /var/log/nginx/io.cloudcmd.io.access.log;
}
```

```sh
# create a symlink of this file
ln -s ./sites-available/io.cloudcmd.io ./sites-enabled
# restart nginx
/etc/init.d/nginx restart
```

Deploy
---------------
`Cloud Commander` can be easily deployed to [Heroku](https://heroku.com/deploy?template=https://github.com/coderaiser/cloudcmd "Deploy to Heroku").

[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.png "Deploy to Heroku")]( https://heroku.com/deploy?template=https://github.com/coderaiser/cloudcmd)

Docker
---------------
`Cloud Commander` can be used as [docker container](https://hub.docker.com/r/coderaiser/cloudcmd/ "Docker container") like so:

```sh
docker run -t --rm -v ~:/root -v /:/mnt/fs -w=/root -p 8000:8000 coderaiser/cloudcmd
```

Configuration will be read from the home directory, the host's root file system will be mounted to `/mnt/fs`, and port `8000` port will exposed to the host's port.

Also, you can use [docker compose](https://docs.docker.com/compose/ "Docker Compose") with `docker-compose.yml`:

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

When you create this file, run:

```sh
docker-compose up
```

# Dropbox

Dropbox support is integrated into Cloud Commander, and you can switch from your local file system to a Dropbox account.
All you need to do is set `--dropbox` option and [generate a dropbox token](https://blogs.dropbox.com/developers/2014/05/generate-an-access-token-for-your-own-account/) for your account.

This could look like this:

```sh
cloudcmd --dropbox --dropbox-token your-dropbox-token
```

While using Dropbox remember that there is no remote support for the console/terminal. Seeing the progress of file operations is also not supported. There's only basic support, but you can do the following things with files and directories:

- create
- remove
- rename/move
- view
- edit

Get involved
---------------

There are a lot of ways to be involved in `Cloud Commander` development:

- if you find a bug or have an idea to share, [create an issue](https://github.com/coderaiser/cloudcmd/issues/new "Create issue");
- if you fixed a bug, typo or implemented a new feature, [create a pull request](https://github.com/coderaiser/cloudcmd/compare "Create pull request");
- if you know a language not currently translated, or would like to improve an existing translation, you can help with [site translations](https://github.com/coderaiser/cloudcmd/wiki "Cloud Commander community wiki");

Version history
---------------
- *2019.04.15*, **[v12.1.0](//github.com/coderaiser/cloudcmd/releases/tag/v12.1.0)**
- *2019.04.04*, **[v12.0.2](//github.com/coderaiser/cloudcmd/releases/tag/v12.0.2)**
- *2019.04.04*, **[v12.0.1](//github.com/coderaiser/cloudcmd/releases/tag/v12.0.1)**
- *2019.04.01*, **[v12.0.0](//github.com/coderaiser/cloudcmd/releases/tag/v12.0.0)**
- *2019.03.27*, **[v11.8.6](//github.com/coderaiser/cloudcmd/releases/tag/v11.8.6)**
- *2019.02.20*, **[v11.8.5](//github.com/coderaiser/cloudcmd/releases/tag/v11.8.5)**
- *2019.02.15*, **[v11.8.4](//github.com/coderaiser/cloudcmd/releases/tag/v11.8.4)**
- *2018.12.04*, **[v11.8.3](//github.com/coderaiser/cloudcmd/releases/tag/v11.8.3)**
- *2018.11.22*, **[v11.8.2](//github.com/coderaiser/cloudcmd/releases/tag/v11.8.2)**
- *2018.11.14*, **[v11.8.1](//github.com/coderaiser/cloudcmd/releases/tag/v11.8.1)**
- *2018.11.09*, **[v11.8.0](//github.com/coderaiser/cloudcmd/releases/tag/v11.8.0)**
- *2018.11.01*, **[v11.7.1](//github.com/coderaiser/cloudcmd/releases/tag/v11.7.1)**
- *2018.10.25*, **[v11.7.0](//github.com/coderaiser/cloudcmd/releases/tag/v11.7.0)**
- *2018.10.23*, **[v11.6.0](//github.com/coderaiser/cloudcmd/releases/tag/v11.6.0)**
- *2018.10.23*, **[v11.5.4](//github.com/coderaiser/cloudcmd/releases/tag/v11.5.4)**
- *2018.10.19*, **[v11.5.3](//github.com/coderaiser/cloudcmd/releases/tag/v11.5.3)**
- *2018.10.19*, **[v11.5.2](//github.com/coderaiser/cloudcmd/releases/tag/v11.5.2)**
- *2018.10.17*, **[v11.5.1](//github.com/coderaiser/cloudcmd/releases/tag/v11.5.1)**
- *2018.10.16*, **[v11.5.0](//github.com/coderaiser/cloudcmd/releases/tag/v11.5.0)**
- *2018.10.16*, **[v11.4.1](//github.com/coderaiser/cloudcmd/releases/tag/v11.4.1)**
- *2018.10.12*, **[v11.4.0](//github.com/coderaiser/cloudcmd/releases/tag/v11.4.0)**
- *2018.10.12*, **[v11.3.1](//github.com/coderaiser/cloudcmd/releases/tag/v11.3.1)**
- *2018.10.11*, **[v11.3.0](//github.com/coderaiser/cloudcmd/releases/tag/v11.3.0)**
- *2018.10.04*, **[v11.2.3](//github.com/coderaiser/cloudcmd/releases/tag/v11.2.3)**
- *2018.09.28*, **[v11.2.2](//github.com/coderaiser/cloudcmd/releases/tag/v11.2.2)**
- *2018.09.28*, **[v11.2.1](//github.com/coderaiser/cloudcmd/releases/tag/v11.2.1)**
- *2018.09.28*, **[v11.2.0](//github.com/coderaiser/cloudcmd/releases/tag/v11.2.0)**
- *2018.09.27*, **[v11.1.0](//github.com/coderaiser/cloudcmd/releases/tag/v11.1.0)**
- *2018.09.26*, **[v11.0.0](//github.com/coderaiser/cloudcmd/releases/tag/v11.0.0)**
- *2018.09.21*, **[v10.8.2](//github.com/coderaiser/cloudcmd/releases/tag/v10.8.2)**
- *2018.09.20*, **[v10.8.1](//github.com/coderaiser/cloudcmd/releases/tag/v10.8.1)**
- *2018.09.19*, **[v10.8.0](//github.com/coderaiser/cloudcmd/releases/tag/v10.8.0)**
- *2018.09.14*, **[v10.7.0](//github.com/coderaiser/cloudcmd/releases/tag/v10.7.0)**
- *2018.09.10*, **[v10.6.0](//github.com/coderaiser/cloudcmd/releases/tag/v10.6.0)**
- *2018.09.08*, **[v10.5.3](//github.com/coderaiser/cloudcmd/releases/tag/v10.5.3)**
- *2018.08.25*, **[v10.5.2](//github.com/coderaiser/cloudcmd/releases/tag/v10.5.2)**
- *2018.08.25*, **[v10.5.1](//github.com/coderaiser/cloudcmd/releases/tag/v10.5.1)**
- *2018.08.23*, **[v10.5.0](//github.com/coderaiser/cloudcmd/releases/tag/v10.5.0)**
- *2018.07.18*, **[v10.4.1](//github.com/coderaiser/cloudcmd/releases/tag/v10.4.1)**
- *2018.07.17*, **[v10.4.0](//github.com/coderaiser/cloudcmd/releases/tag/v10.4.0)**
- *2018.07.02*, **[v10.3.2](//github.com/coderaiser/cloudcmd/releases/tag/v10.3.2)**
- *2018.06.25*, **[v10.3.1](//github.com/coderaiser/cloudcmd/releases/tag/v10.3.1)**
- *2018.06.22*, **[v10.3.0](//github.com/coderaiser/cloudcmd/releases/tag/v10.3.0)**
- *2018.06.21*, **[v10.2.3](//github.com/coderaiser/cloudcmd/releases/tag/v10.2.3)**
- *2018.06.15*, **[v10.2.2](//github.com/coderaiser/cloudcmd/releases/tag/v10.2.2)**
- *2018.06.13*, **[v10.2.1](//github.com/coderaiser/cloudcmd/releases/tag/v10.2.1)**
- *2018.06.11*, **[v10.2.0](//github.com/coderaiser/cloudcmd/releases/tag/v10.2.0)**
- *2018.06.09*, **[v10.1.2](//github.com/coderaiser/cloudcmd/releases/tag/v10.1.2)**
- *2018.06.08*, **[v10.1.1](//github.com/coderaiser/cloudcmd/releases/tag/v10.1.1)**
- *2018.06.07*, **[v10.1.0](//github.com/coderaiser/cloudcmd/releases/tag/v10.1.0)**
- *2018.06.04*, **[v10.0.3](//github.com/coderaiser/cloudcmd/releases/tag/v10.0.3)**
- *2018.05.29*, **[v10.0.2](//github.com/coderaiser/cloudcmd/releases/tag/v10.0.2)**
- *2018.05.29*, **[v10.0.1](//github.com/coderaiser/cloudcmd/releases/tag/v10.0.1)**
- *2018.05.25*, **[v10.0.0](//github.com/coderaiser/cloudcmd/releases/tag/v10.0.0)**
- *2018.05.24*, **[v9.6.0](//github.com/coderaiser/cloudcmd/releases/tag/v9.6.0)**
- *2018.05.15*, **[v9.5.0](//github.com/coderaiser/cloudcmd/releases/tag/v9.5.0)**
- *2018.05.08*, **[v9.4.0](//github.com/coderaiser/cloudcmd/releases/tag/v9.4.0)**
- *2018.05.01*, **[v9.3.2](//github.com/coderaiser/cloudcmd/releases/tag/v9.3.2)**
- *2018.04.30*, **[v9.3.1](//github.com/coderaiser/cloudcmd/releases/tag/v9.3.1)**
- *2018.04.27*, **[v9.3.0](//github.com/coderaiser/cloudcmd/releases/tag/v9.3.0)**
- *2018.04.25*, **[v9.2.0](//github.com/coderaiser/cloudcmd/releases/tag/v9.2.0)**
- *2018.04.23*, **[v9.1.6](//github.com/coderaiser/cloudcmd/releases/tag/v9.1.6)**
- *2018.04.19*, **[v9.1.5](//github.com/coderaiser/cloudcmd/releases/tag/v9.1.5)**
- *2018.04.17*, **[v9.1.4](//github.com/coderaiser/cloudcmd/releases/tag/v9.1.4)**
- *2018.04.16*, **[v9.1.3](//github.com/coderaiser/cloudcmd/releases/tag/v9.1.3)**
- *2018.04.12*, **[v9.1.2](//github.com/coderaiser/cloudcmd/releases/tag/v9.1.2)**
- *2018.04.10*, **[v9.1.1](//github.com/coderaiser/cloudcmd/releases/tag/v9.1.1)**
- *2018.04.02*, **[v9.1.0](//github.com/coderaiser/cloudcmd/releases/tag/v9.1.0)**
- *2018.03.30*, **[v9.0.0](//github.com/coderaiser/cloudcmd/releases/tag/v9.0.0)**
- *2018.03.24*, **[v8.5.2](//github.com/coderaiser/cloudcmd/releases/tag/v8.5.2)**
- *2018.03.24*, **[v8.5.1](//github.com/coderaiser/cloudcmd/releases/tag/v8.5.1)**
- *2018.03.20*, **[v8.5.0](//github.com/coderaiser/cloudcmd/releases/tag/v8.5.0)**
- *2018.03.16*, **[v8.4.1](//github.com/coderaiser/cloudcmd/releases/tag/v8.4.1)**
- *2018.03.14*, **[v8.4.0](//github.com/coderaiser/cloudcmd/releases/tag/v8.4.0)**
- *2018.03.02*, **[v8.3.0](//github.com/coderaiser/cloudcmd/releases/tag/v8.3.0)**
- *2018.02.19*, **[v8.2.2](//github.com/coderaiser/cloudcmd/releases/tag/v8.2.2)**
- *2018.01.23*, **[v8.2.1](//github.com/coderaiser/cloudcmd/releases/tag/v8.2.1)**
- *2018.01.16*, **[v8.2.0](//github.com/coderaiser/cloudcmd/releases/tag/v8.2.0)**
- *2017.12.08*, **[v8.1.3](//github.com/coderaiser/cloudcmd/releases/tag/v8.1.3)**
- *2017.10.23*, **[v8.1.2](//github.com/coderaiser/cloudcmd/releases/tag/v8.1.2)**
- *2017.10.19*, **[v8.1.1](//github.com/coderaiser/cloudcmd/releases/tag/v8.1.1)**
- *2017.10.19*, **[v8.1.0](//github.com/coderaiser/cloudcmd/releases/tag/v8.1.0)**
- *2017.10.13*, **[v8.0.5](//github.com/coderaiser/cloudcmd/releases/tag/v8.0.5)**
- *2017.10.10*, **[v8.0.4](//github.com/coderaiser/cloudcmd/releases/tag/v8.0.4)**
- *2017.10.06*, **[v8.0.3](//github.com/coderaiser/cloudcmd/releases/tag/v8.0.3)**
- *2017.10.06*, **[v8.0.2](//github.com/coderaiser/cloudcmd/releases/tag/v8.0.2)**
- *2017.10.02*, **[v8.0.1](//github.com/coderaiser/cloudcmd/releases/tag/v8.0.1)**
- *2017.10.02*, **[v8.0.0](//github.com/coderaiser/cloudcmd/releases/tag/v8.0.0)**
- *2017.09.29*, **[v7.9.0](//github.com/coderaiser/cloudcmd/releases/tag/v7.9.0)**
- *2017.09.25*, **[v7.8.0](//github.com/coderaiser/cloudcmd/releases/tag/v7.8.0)**
- *2017.09.22*, **[v7.7.3](//github.com/coderaiser/cloudcmd/releases/tag/v7.7.3)**
- *2017.09.22*, **[v7.7.2](//github.com/coderaiser/cloudcmd/releases/tag/v7.7.2)**
- *2017.09.18*, **[v7.7.1](//github.com/coderaiser/cloudcmd/releases/tag/v7.7.1)**
- *2017.09.12*, **[v7.7.0](//github.com/coderaiser/cloudcmd/releases/tag/v7.7.0)**
- *2017.09.11*, **[v7.6.0](//github.com/coderaiser/cloudcmd/releases/tag/v7.6.0)**
- *2017.09.08*, **[v7.5.2](//github.com/coderaiser/cloudcmd/releases/tag/v7.5.2)**
- *2017.09.08*, **[v7.5.1](//github.com/coderaiser/cloudcmd/releases/tag/v7.5.1)**
- *2017.09.08*, **[v7.5.0](//github.com/coderaiser/cloudcmd/releases/tag/v7.5.0)**
- *2017.09.04*, **[v7.4.0](//github.com/coderaiser/cloudcmd/releases/tag/v7.4.0)**
- *2017.08.29*, **[v7.3.2](//github.com/coderaiser/cloudcmd/releases/tag/v7.3.2)**
- *2017.08.14*, **[v7.3.1](//github.com/coderaiser/cloudcmd/releases/tag/v7.3.1)**
- *2017.08.14*, **[v7.3.0](//github.com/coderaiser/cloudcmd/releases/tag/v7.3.0)**
- *2017.08.11*, **[v7.2.2](//github.com/coderaiser/cloudcmd/releases/tag/v7.2.2)**
- *2017.07.31*, **[v7.2.1](//github.com/coderaiser/cloudcmd/releases/tag/v7.2.1)**
- *2017.07.28*, **[v7.2.0](//github.com/coderaiser/cloudcmd/releases/tag/v7.2.0)**
- *2017.07.27*, **[v7.1.1](//github.com/coderaiser/cloudcmd/releases/tag/v7.1.1)**
- *2017.07.27*, **[v7.1.0](//github.com/coderaiser/cloudcmd/releases/tag/v7.1.0)**
- *2017.07.14*, **[v7.0.2](//github.com/coderaiser/cloudcmd/releases/tag/v7.0.2)**
- *2017.07.12*, **[v7.0.1](//github.com/coderaiser/cloudcmd/releases/tag/v7.0.1)**
- *2017.07.12*, **[v7.0.0](//github.com/coderaiser/cloudcmd/releases/tag/v7.0.0)**
- *2017.07.14*, **[v6.15.5](//github.com/coderaiser/cloudcmd/releases/tag/v6.15.5)**
- *2017.07.10*, **[v6.15.4](//github.com/coderaiser/cloudcmd/releases/tag/v6.15.4)**
- *2017.06.26*, **[v6.15.3](//github.com/coderaiser/cloudcmd/releases/tag/v6.15.3)**
- *2017.06.22*, **[v6.15.2](//github.com/coderaiser/cloudcmd/releases/tag/v6.15.2)**
- *2017.06.14*, **[v6.15.1](//github.com/coderaiser/cloudcmd/releases/tag/v6.15.1)**
- *2017.06.06*, **[v6.15.0](//github.com/coderaiser/cloudcmd/releases/tag/v6.15.0)**
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
    - add ability to not hide path and header when files are scrolling;

