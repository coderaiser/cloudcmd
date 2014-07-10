Cloud Commander v1.1.0
===============
###[Main][MainURL] [Blog][BlogURL] Live(![JitSu][JitSu_LIVE_IMG] [JitSu][JitSuURL], ![Heroku][Heroku_LIVE_IMG] [Heroku][HerokuURL])
[NPM_INFO_IMG]:             https://nodei.co/npm/cloudcmd.png?downloads=true&&stars "npm install cloudcmd"
[MainURL]:                  http://cloudcmd.io "Main"
[BlogURL]:                  http://blog.cloudcmd.io "Blog"
[JitSuURL]:                 http://cloudcmd.jit.su "JitSu"
[HerokuURL]:                http://cloudcmd.herokuapp.com/ "Heroku"
[JitSu_LIVE_IMG]:           https://status-ok.cloudcmd.io/host/cloudcmd.jit.su/img/txt.png "JitSu"
[HEROKU_LIVE_IMG]:          https://status-ok.cloudcmd.io/host/cloudcmd.herokuapp.com/img/txt.png "Heroku"

**Cloud Commander** web based orthodox file manager with console and editor. Will help you manage the server and work with files, folders and programs in browser from any computer, mobile or tablet device.

![Cloud Commander](/img/logo/cloudcmd.png "Cloud Commander")

Benefits
---------------

- Open Source (**MIT License**).
- Has 2 classic panels.
- Optional **authorization**.
- Client works in web browser.
- Server works on **Windows**, **Linux** and **Mac OS**.
- Could be used local or remotely.
- Adapting to screen size.
- **Editor** with support of **syntax highlighting** for over 110 languages.
- **Console** with support of default OS command line.
- Written in **JavaScript/Node.js**.

Install
---------------

The installation of file manager is very simple.

- install [node.js](http://nodejs.org/ "node.js") if you still have not.
- install ```cloudcmd``` via ```npm``` with one simple command.

![NPM_INFO][NPM_INFO_IMG]

Start
---------------
To start **Cloud Commander** only one command needed:
    
    node cloudcmd
or if you install with `-g` flag just type:

    cloudcmd

Cloud Commander reads port information from config file `json/config.json` and start server
on default port (`8000`), if none of port variables (`cloud9`, `cloudfoundry` and `nodester`) isn't exist.
To start work type in address bar of your browser:

    http://127.0.0.1:8000

Update
---------------
**Cloud Commander** is very often updated.

Update is doing automatically but it could be done also manualy.
If you cloned repository you could get last changes with:

    git pull

If you installed Cloud Commander with `npm` just re-install it:

    npm i cloudcmd -g

After that clear cache of your browser, restart application and reload page.

Hot keys
---------------

|Key                    |Operation
|:----------------------|:--------------------------------------------
| `F1`                  | help
| `F2`                  | rename
| `F3`                  | view
| `Shift + F3`          | view as `markdown`
| `F4`                  | edit
| `F5`                  | copy
| `F6`                  | rename/move
| `F7`                  | new dir
| `Shift + F7`          | new file
| `F8`, `Delete`        | remove
| `Shift + Delete`      | remove without prompt
| `F9`                  | menu
| `F10`                 | config
| `*`                   | select/unselect all
| `+`                   | expand selection
| `-`                   | shrink selection
| `Ctrl + r`            | refresh
| `Ctrl + d`            | clear local storage
| `Alt  + q`            | disable key bindings
| `Alt  + s`            | get all key bindings back
| `Ctrl + a`            | select all files in a panel
| `Up`, `Down`, `Enter` | filesystem navigation
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

###Hot keys
|Key                    |Operation
|:----------------------|:--------------------------------------------
| `F3`                  | open
| `Esc`                 | close

Edit
---------------
![Edit](/img/screen/edit.png "Edit")

### Features
- Syntax highlighting based on extension of file for over 110 languages.
- Build in `emmet` (for html files)
- Drag n drop (drag file from desktop to editor).
- Build in `jshint` (with options in `.jshintrc` file)
- Configurable options (could be edited in `json/edit.json`)

###Hot keys
|Key                    |Operation
|:----------------------|:--------------------------------------------
|`F4`                   | open
| `Ctrl + s`            | save
| `Ctrl + f`            | find
| `Ctrl + h`            | replace
| `Ctrl + g`            | go to line
| `Esc`                 | close

For more details see [Ace keyboard shortcuts](https://github.com/ajaxorg/ace/wiki/Default-Keyboard-Shortcuts "Ace keyboard shortcuts").

Console
---------------
![Console](/img/screen/console.png "Console")

###Hot keys
|Key                    |Operation
|:----------------------|:--------------------------------------------
| `~`                   | open
| `Ctrl + p`            | paste path of current directory
| `Ctrl + z`            | cancel current prompt
| `Ctrl + l`            | clear
| `Esc`                 | close

Config
---------------
![Console](/img/screen/config.png "Config")

###Hot keys
|Key                    |Operation
|:----------------------|:--------------------------------------------
| `F10`                 | open
| `Esc`                 | close

Menu
---------------
![Menu](/img/screen/menu.png "Menu")
Right mouse click button shows context menu with items:

- View
- Edit
- Rename
- Delete
- Zip file
- Unzip file
- (Un)Select All
- Upload to (Dropbox, Github, GDrive, FilePicker)
- Download
- New (File, Dir, from FilePicker)

###Hot keys
|Key                    |Operation
|:----------------------|:--------------------------------------------
| `F9`                  | open
| `Esc`                 | close

Configuration
---------------
All main configuration could be done via `json/config.json`.

```js
{
    "auth"              : false,    /* enable http authentication               */
    "username"          : "root",   /* username for authentication              */
    "password"          : "toor",   /* password hash in sha-1 for authentication*/
    "appCache"          : false,    /* cache files for offline use              */
    "analytics"         : true,     /* google analytics support                 */
    "diff"              : true,     /* when save - send patch, not whole file   */
    "zip"               : true,     /* zip text before send / unzip before save */
    "notifications"     : false,    /* show notifications when tab is not active*/
    "localStorage"      : true,     /* cache directory data                     */
    "minify"            : true      /* minification of js,css,html and img      */
    "online"            : true,     /* load js files from cdn or local path     */
    "cache"             : true,     /* add cache-control                        */
    "logs"              : false,    /* logs or console ouput                    */
    "showKeysPanel"     : true,     /* show classic panel with buttons of keys  */
    "server"            : true,     /* server mode or testing mode              */
    "socket"            : true      /* enable web sockets                       */
    "port"              : 8000,     /* http port                                */
    "sslPort"           : 443,      /* https port                               */
    "ip"                : null,     /* ip or null(default)                      */
    "ssl"               : false     /* should use https?                        */
    "rest"              : true      /* enable rest interface                    */
}
```

If you had changed **config** and want to keep updating via git,
you should execute next command in root directory of **Cloud Commander**:

```
git update-index --assume-unchanged json/config.json
```

To get back to tracking:

```
git update-index --no-assume-unchanged json/config.json
```

Server
---------------
Standard practices say no non-root process gets to talk to
the Internet on a port less than 1024. Anyway I suggest you
to start Cloud Commander as non-root. How it could be solved?
There is a couple easy and fast ways. One of them is port forwarding.
###Iptables
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

###nginx
Get [nginx](http://nginx.org/ "nginx"). On linux it could be done this way:

```sh
sudo apt-get install nginx #for ubuntu and debian
```

Than make host file **/etc/nginx/sites-enabled/io.cloudcmd.io**
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

If you want add **ssl**, add a couple lines to server block:

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

For websocket support (nginx >= v1.3.13) modify server block:

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
ln -s ./sites-enabled/io.cloudcmd.io ./sites-available
# restart nginx
/etc/init.d/nginx restart
```

To run Cloud Commander as daemon in linux you could set **log** to true in config and
do something like this:
    
    nohup node cloudcmd

Additional modules list
---------------
To extend capabilities of file manager next modules used:

- [Ace]                     [AceURL]
- [Diff-Match-Patch]        [Diff-Match-PatchURL]
- [Minify]                  [MinifyURL]
- [FancyBox]                [FancyBoxURL]
- [jq-console]              [jq-consoleURL]
- [github]                  [githubURL]
- [dropbox-js]              [dropbox-jsURL]
- [jquery]                  [jqueryURL]
- [socket.io]               [socketIOURL]
- [http-auth]               [httpAuthURL]
- [rimraf]                  [rimrafURL]
- [mkdirp]                  [mkdirpURL]

[AceURL]:                   http://ace.ajax.org/ "Ace"
[Diff-Match-PatchURL]:      https://code.google.com/p/google-diff-match-patch/ "Diff-Match-Patch"
[MinifyURL]:                http://coderaiser.github.io/minify "Minify"
[FancyBoxURL]:              //github.com/fancyapps/fancyBox "FancyBox"
[jq-consoleURL]:            //github.com/replit/jq-console "jq-console"
[githubURL]:                //github.com/michael/github "github"
[dropbox-jsURL]:            //github.com/dropbox/dropbox-js "dropbox-js"
[jqueryURL]:                //jquery.com
[socketIOURL]:              http://socket.io
[httpAuthURL]:              //github.com/gevorg/http-auth
[rimrafURL]:                //github.com/isaacs/rimraf "rimraf"
[mkdirpURL]:                //github.com/substack/node-mkdirp

Contributing
---------------
If you would like to contribute - read [guide](https://github.com/coderaiser/cloudcmd/blob/master/CONTRIBUTING.md) and send pull requests to dev branch.
Getting dev version of **Cloud Commander**:

    git clone git://github.com/coderaiser/cloudcmd.git
    cd cloudcmd && git checkout dev


Version history
---------------
- *2014.07.10*, **[v1.1.0](//github.com/cloudcmd/archive/raw/master/cloudcmd-v1.1.0.zip)**
- *2014.07.03*, **[v1.0.0](//github.com/cloudcmd/archive/raw/master/cloudcmd-v1.0.0.zip)**
- *2014.06.16*, **[v0.9.2](//github.com/cloudcmd/archive/raw/master/cloudcmd-v0.9.2.zip)**
- *2014.06.11*, **[v0.9.1](//github.com/cloudcmd/archive/raw/master/cloudcmd-v0.9.1.zip)**
- *2014.06.10*, **[v0.9.0](//github.com/cloudcmd/archive/raw/master/cloudcmd-v0.9.0.zip)**
- *2014.04.28*, **[v0.8.4](//github.com/cloudcmd/archive/raw/master/cloudcmd-v0.8.4.zip)**
- *2014.03.19*, **[v0.8.3](//github.com/cloudcmd/archive/raw/master/cloudcmd-v0.8.3.zip)**
- *2014.03.03*, **[v0.8.2](//github.com/cloudcmd/archive/raw/master/cloudcmd-v0.8.2.zip)**
- *2014.02.13*, **[v0.8.1](//github.com/cloudcmd/archive/raw/master/cloudcmd-v0.8.1.zip)**
- *2014.02.13*, **[v0.8.0](//github.com/cloudcmd/archive/raw/master/cloudcmd-v0.8.0.zip)**
- *2013.12.09*, **[v0.7.0](//github.com/cloudcmd/archive/raw/master/cloudcmd-v0.7.0.zip)**
- *2013.11.08*, **[v0.6.0](//github.com/cloudcmd/archive/raw/master/cloudcmd-v0.6.0.zip)**
- *2013.10.17*, **[v0.5.0](//github.com/cloudcmd/archive/raw/master/cloudcmd-v0.5.0.zip)**
- *2013.09.27*, **[v0.4.0](//github.com/cloudcmd/archive/raw/master/cloudcmd-v0.4.0.zip)**
- *2013.08.01*, **[v0.3.0](//github.com/cloudcmd/archive/raw/master/cloudcmd-v0.3.0.zip)**
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
- [Polietilena](http://polietilena.github.io/ "Polietilena") for **logo** and **favicon**.
- [TarZak](https://github.com/tarzak)
    - Russian and Ukrainian translations;
    - config template and style;
    - change order of directories and files;
    - add ability do not hide path and header when files are scrolling;
