Cloud Commander v0.7.0 [![NPM version][NPMIMGURL]][NPMURL] [![Dependency Status][DependencyStatusIMGURL]][DependencyStatusURL] [![Build Status][BuildStatusIMGURL]][BuildStatusURL]
===============
###[Main][MainURL] [Blog][BlogURL] Live(![IO][IO_LIVE_IMG] [IO][IOURL], ![JitSu][JitSu_LIVE_IMG] [JitSu][JitSuURL], ![Heroku][Heroku_LIVE_IMG] [Heroku][HerokuURL] ![RunKite][RunKite_LIVE_IMG] [RunKite][RunKiteURL])
[NPMIMGURL]:                https://badge.fury.io/js/cloudcmd.png
[BuildStatusIMGURL]:        https://secure.travis-ci.org/coderaiser/cloudcmd.png?branch=master
[DependencyStatusIMGURL]:   https://gemnasium.com/coderaiser/cloudcmd.png
[FlattrIMGURL]:             https://api.flattr.com/button/flattr-badge-large.png
[NPM_INFO_IMG]:             https://nodei.co/npm/cloudcmd.png?downloads=true&&stars
[NPMURL]:                   https://npmjs.org/package/cloudcmd "npm"
[BuildStatusURL]:           http://travis-ci.org/coderaiser/cloudcmd  "Build Status"
[DependencyStatusURL]:      https://gemnasium.com/coderaiser/cloudcmd "Dependency Status"
[FlattrURL]:                https://flattr.com/submit/auto?user_id=coderaiser&url=github.com/coderaiser/cloudcmd&title=cloudcmd&language=&tags=github&category=software "flattr"
[MainURL]:                  http://cloudcmd.io "Main"
[BlogURL]:                  http://blog.cloudcmd.io "Blog"
[IOURL]:                    http://io.cloudcmd.io "IO"
[JitSuURL]:                 http://cloudcmd.jit.su "JitSu"
[HerokuURL]:                http://cloudcmd.herokuapp.com/ "Heroku"
[RunKiteURL]:               http://cloudcmd.apps.runkite.com/ "RunKite"
[IO_LIVE_IMG]:              https://status-ok.cloudcmd.io/host/io.cloudcmd.io/fs?json "IO"
[JitSu_LIVE_IMG]:           https://status-ok.cloudcmd.io/host/cloudcmd.jit.su/fs?json "JitSu"
[HEROKU_LIVE_IMG]:          https://status-ok.cloudcmd.io/host/cloudcmd.herokuapp.com/fs?json "Heroku"
[RunKite_LIVE_IMG]:         https://status-ok.cloudcmd.io/host/cloudcmd.apps.runkite.com/fs?json "RunKite"

**Cloud Commander** - cloud file manager with console and editor.

![Cloud Commander](/img/logo/cloudcmd.png "Cloud Commander")

[![Flattr][FlattrIMGURL]][FlattrURL]

Benefits
---------------

- Open Source.
- Has 2 classic ortodox panels.
- Works on Windows, Linux and Mac OS.
- Could be used local or remotly.
- Has nice console and editor.
- Wrote on JavaScript/Node.js.

Install
---------------
[![NPM_INFO][NPM_INFO_IMG]][NPMURL]

Installing **Cloud Commander** is very simple.
All you need is 

- install [node.js](http://nodejs.org/ "node.js")
- [download](https://github.com/coderaiser/cloudcmd/archive/master.zip)
and unpack or just clone repository from github:

```
git clone git://github.com/coderaiser/cloudcmd.git
cd cloudcmd
node cloudcmd
```
or install in npm:

```
npm i cloudcmd -g
cloudcmd
```

Additional modules
---------------
**Cloud Commander's Server Side** not using additional modules for main functionality.
But for console and minification and optimization tricks optional can be
assingned (and installed) modules: [Minify] (https://github.com/coderaiser/minify "Minify")
and [socket.io] (https://github.com/LearnBoost/socket.io "Socket.IO").

Install addtitional modules (type in **Cloud Commander** directory):

    npm i


Hot keys
---------------

- **F1**                - help
- **F2**                - rename current file
- **F3**                - view
- **F4**                - edit
- **F5**                - copy
- **F6**                - rename/move
- **F7**                - new dir
- **F8, Delete**        - remove current file
- **F9**                - menu
- **F10**               - config
- **Ctrl + r**          - reload dir content
- **Ctrl + d**          - clear local cache (wich contains dir contents)
- **Alt  + q**          - disable key bindings
- **Alt  + s**          - get all key bindings back
- **Ctrl + a**          - select all files in a panel
- **up, down, enter**   - filesystem navigation
- **Tab**               - move via panels
- **Page Up**           - up on one page
- **Page Down**         - down on one page
- **Home**              - to begin of list
- **End**               - to end of list
- **Shift + Delete**    - remove without prompt
- **Insert**            - select current file
- **Shift + F10**       - context menu
- **~**                 - console
- **Ctrl + Click**      - open file on new tab

Edit
---------------
[Demo](http://io.cloudcmd.io/fs/etc#/edit/passwd "Edit")
![Edit](/img/screen/edit.png "Edit")

###Hot keys
- **F4**                - open
- **Ctrl + s**          - save
- **Ctrl + f**          - find
- **Ctrl + f + f**      - replace
- **Ctrl + g**          - go to line
- **Esc**               - close

For more details see [Ace keyboard shortcuts](https://github.com/ajaxorg/ace/wiki/Default-Keyboard-Shortcuts "Ace keyboard shortcuts").

Console
---------------
[Demo](http://io.cloudcmd.io#/console "Console")
![Console](/img/screen/console.png "Console")

###Hot keys
- **~**                 - open
- **Esc**               - close

Config
---------------
[Demo](http://io.cloudcmd.io#/config "Config")
![Console](/img/screen/config.png "Config")

###Hot keys
- **F10**               - open
- **Esc**               - close

Menu
---------------
[Demo](http://io.cloudcmd.io#/menu "Menu")
![Menu](/img/screen/menu.png "Menu")
Right mouse click button shows context menu with items:

- View
- Edit
- Rename
- Delete
- Zip file
- (Un)Select All
- Upload to (Dropbox, Github, GDrive)
- Download
- New (File, Dir, from cloud)

###Hot keys
- **F9**                - open
- **Esc**               - close

Configuration
---------------
All main configuration could be done via [config.json](json/config.json "Config").

```js
{
    "auth"              : false,    /* enable http authentication               */
    "username"          : "root",   /* username for authentication              */
    "password"          : "toor",   /* password hash in sha-1 for authentication*/
    "apiURL"            :"/api/v1",
    "appCache"          : false,    /* cache files for offline use              */
    "analytics"         : true,     /* google analytics suport                  */
    "diff"              : false,    /* when save - send patch, not whole file   */
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
Just run [shell/addtables.sh](shell/addtables.sh) for default options.

```sh
@:/tmp/cloudcmd (dev) $ sudo iptables -t nat -L # look rules before
@:/tmp/cloudcmd (dev) $ sudo iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-ports 8000
@:/tmp/cloudcmd (dev) $ sudo iptables -t nat -A PREROUTING -p tcp --dport 443 -j REDIRECT --to-ports 4430
@:/tmp/cloudcmd (dev) $ sudo iptables -t nat -L # look rules after
```

You should see something like this ( **8000** and **4430** should be in config as **port** and **sslPort** )

    target     prot opt source               destination
    REDIRECT   tcp  --  anywhere             anywhere             tcp dpt:http redir ports 8000
    REDIRECT   tcp  --  anywhere             anywhere             tcp dpt:https redir ports 4430

If you would want to get things back just clear rules ( **1** and **2** it's rule numbers,
in your list they could differ).

```sh
@:/tmp/cloudcmd (dev) $ sudo iptables -t nat -D PREROUTING 2
@:/tmp/cloudcmd (dev) $ sudo iptables -t nat -D PREROUTING 1
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

For websocket suport (nginx >= v1.3.13) modify server block:

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

Start
---------------
To start **Cloud Commander** only one command needed:
    
    node cloudcmd
or on win platform just

    cloudcmd
After that Cloud Commander reads port information from config file [config.json](json/config.json#L17 "Config") and start server
on this port ( **8000** by default ), if none of port variables ( *cloud9*, *cloudfoundry* and *nodester* ) isn't exist.
Then type in browser

    http://127.0.0.1:8000
or

    http://localhost:8000
Update
---------------
**Cloud Commander** is very often updates.
Update is doing automagically but it could be done also manualy
by typing a few commands in cloudcmd directory:

    git pull
or check new version on npm

    npm info cloudcmd

and then, if there is new version

    npm r cloudcmd
    npm i cloudcmd

Extensions
---------------
**Cloud Commander** desinged to easily porting extensions.
For extend main functionality Cloud Commander use next modules:

- [Ace]                     [AceURL]
- [FancyBox]                [FancyBoxURL]
- [jQuery-contextMenu]      [jQuery-contextMenuURL]
- [jq-console]              [jq-consoleURL]
- [github]                  [githubURL]
- [dropbox-js]              [dropbox-jsURL]
- [jquery]                  [jqueryURL]
- [socket.io]               [socketIOURL]
- [http-auth]               [httpAuthURL]

[AceURL]:                   http://ace.ajax.org/ "Ace"
[FancyBoxURL]:              //github.com/fancyapps/fancyBox "FancyBox"
[jQuery-contextMenuURL]:    //github.com/medialize/jQuery-contextMenu "jQuery-contextMenu"
[jq-consoleURL]:            //github.com/replit/jq-console "jq-console"
[githubURL]:                //github.com/michael/github "github"
[dropbox-jsURL]:            //github.com/dropbox/dropbox-js "dropbox-js"
[jqueryURL]:                //jquery.com
[socketIOURL]:              http://socket.io
[httpAuthURL]:              //github.com/gevorg/http-auth

Contributing
---------------
If you would like to contribute - send pull request to dev branch.
Getting dev version of **Cloud Commander**:

    git clone git://github.com/coderaiser/cloudcmd.git
    git checkout dev

It is possible that dev version of Cloud Commander will needed dev version of Minify,
so to get it you should type a couple more commands:

    cd node_modules
    rm -rf minify
    git clone git://github.com/coderaiser/minify
    git checkout dev

Version history
---------------
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

License
---------------
MIT [license](LICENSE "license").

Special Thanks
---------------

- [Polietilena](http://polietilena.github.io/ "Polietilena") for [logo](img/logo/cloudcmd.png "logo") and [favicon](img/favicon/favicon.png "favicon");
- [TarZak](https://github.com/tarzak)
    - [ru](http://ru.cloudcmd.io "Cloud Commander in Russian") and [ua](http://ua.cloudcmd.io "Cloud Commander in Ukrainian") translations;
    - config template and style;
    - change order of directories and files;
    - add ability do not hide path and header when files are scrolling;
