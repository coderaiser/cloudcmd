Cloud Commander v0.3.0 [![NPM version][NPMIMGURL]][NPMURL] [![Dependency Status][DependencyStatusIMGURL]][DependencyStatusURL] [![Build Status][BuildStatusIMGURL]][BuildStatusURL]
===============
[![Flattr][FlattrIMGURL]][FlattrURL]
[NPMIMGURL]:                https://badge.fury.io/js/cloudcmd.png
[BuildStatusIMGURL]:        https://secure.travis-ci.org/coderaiser/cloudcmd.png?branch=master
[DependencyStatusIMGURL]:   https://gemnasium.com/coderaiser/cloudcmd.png
[FlattrIMGURL]:             http://api.flattr.com/button/flattr-badge-large.png
[NPM_INFO_IMG]:             https://nodei.co/npm/cloudcmd.png?downloads=true&&stars
[NPMURL]:                   http://badge.fury.io/js/cloudcmd
[BuildStatusURL]:           http://travis-ci.org/coderaiser/cloudcmd  "Build Status"
[DependencyStatusURL]:      https://gemnasium.com/coderaiser/cloudcmd "Dependency Status"
[FlattrURL]:                https://flattr.com/submit/auto?user_id=coderaiser&url=github.com/coderaiser/cloudcmd&title=cloudcmd&language=&tags=github&category=software "flattr"
[NPM_INFO_URL]:             https://npmjs.org/package/cloudcmd "npm"

**Cloud Commander** - user friendly cloud file manager.
DEMO:
[cloudfoundry] (https://cloudcmd.cloudfoundry.com "cloudfoundry"),
[appfog] (https://cloudcmd.aws.af.cm "appfog"),
[jitsu] (https://cloudcmd.jit.su "jitsu").

Google PageSpeed Score : [100](//developers.google.com/speed/pagespeed/insights#url=http_3A_2F_2Fcloudcmd.aws.af.cm_2F&mobile=false "score") (out of 100)
(or 96 if js or css minification disabled in config.json).

![Cloud Commander](/img/logo/cloudcmd.png "Cloud Commander")

Benefits
---------------
- full browser compatibility *(ie6+,chrome,safari,opera,firefox)*;
- responsible design
- one full page loading, *and then just one-time json-dir-listings loading
(with refresh opportunity).*
- caching read directories *to localStorage (for now)
(so if network will disconnected or something happens with a signal, we
definitely will can work with cached copy of directory listings)*;
- key binding
- disabled js support *(working in limited mode)*.
- automated minification *client js-files and onstart-reading Cloud manager files on server starting.*

**Cloud Commander** uses all benefits of js, so if js is disabled,
we go to *limited mode*.

Limited-mode features
---------------
- no keybinding
- no local caching
- full loading of all web page(with styles, js-scripts, html-page etc).

Hot keys
---------------
In all modern web browsers (but not in IE, becouse he special) hot keys works.
There is a short list:
- **F1**                - help
- **F2**                - rename current file
- **F3**                - view
- **F4**                - edit
- **F5**                - copy
- **F6**                - rename/move
- **F7**                - new dir
- **F8, Delete**        - remove current file
- **F9**                - menu
- **Ctrl + r**          - reload dir content
- **Ctrl + d**          - clear local cache (wich contains dir contents)
- **Alt  + q**          - disable key bindings
- **Alt  + s**          - get all key bindings back
- **Ctrl + a**          - select all files in a panel
- **up, down, enter**   - filesystem navigation
- **Tab**               - move thru panels
- **Page Up**           - up on one page
- **Page Down**         - down on one page
- **Home**              - to begin of list
- **End**               - to end of list
- **Shift + Delete**    - remove without prompt
- **Insert**            - select current file
- **Shift + F10**       - context menu
- **~**                 - console

Viewer's hot keys
---------------
- **F3**                - open
- **Esc**               - close

Editor's hot keys
---------------
- **F4**                - open
- **Ctrl + s**          - save
- **Esc**               - close

Menu
---------------
Right mouse click button show context menu with items:
- View
- Edit
- Rename
- Delete
- Upload to (Dropbox, Github, GDrive)
- Download
- New (File, Dir, from cloud)

Install
---------------
[![NPM_INFO][NPM_INFO_IMG]][NPM_INFO_URL]

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

Configuration
---------------
All main configuration could be done thrue config.json.
```js
{
    "api_url"           :"/api/v1",
    "appcache"          : false,    /* cache files for offline use              */
    "analytics"         : true,     /* google analytics suport                  */
    "localStorage"      : true,     /* cache directory data                     */
    "minification" : {              /* minification of js,css,html and img      */
        "js"    : false,            /* minify module needed                     */
        "css"   : false,            /* npm i minify                             */
        "html"  : true,
        "img"   : false
    },
    "cache"             : true,
    "logs"              : false,     /* logs or console ouput                    */
    "show_keys_panel"   : true,      /* show classic panel with buttons of keys  */
    "server"            : true,      /* server mode or testing mode              */
    "socket"            : true       /* enable web sockets                       */
    "port"              : 8000,      /* http port or null(default)               */
    "sslPort"           : 443,       /* https port or null(default)              */
    "ip"                : null,      /* ip or null(default)                      */
    "ssl"               : false      /* should use https?                        */
    "rest"              : true       /* enable rest interface                    */
}
```

Server
---------------
Standard practices say no non-root process gets to talk to
the Internet on a port less than 1024. Anyway I suggest you
to start Cloud Commander as non-root. How it could be solved?
There is a couple easy and fast ways. One of them is port forwarding by iptables.
Just run [shell/addtables.sh](shell/addtables.sh) for default options.

```sh
@:/tmp/cloudcmd (dev) $ sudo iptables -t nat -L # look rules before
@:/tmp/cloudcmd (dev) $ sudo iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-ports 8000
@:/tmp/cloudcmd (dev) $ sudo iptables -t nat -A PREROUTING -p tcp --dport 443 -j REDIRECT --to-ports 4430
@:/tmp/cloudcmd (dev) $ sudo iptables -t nat -L # look rules after
```
You should see somethins like this ( **8000** and **4430** should be in config as **port** and **sslPort** )

    target     prot opt source               destination
    REDIRECT   tcp  --  anywhere             anywhere             tcp dpt:http redir ports 8000
    REDIRECT   tcp  --  anywhere             anywhere             tcp dpt:https redir ports 4430

If you would want to get things back just clear rules ( **1** and **2** it's rules numbers,
in your list they could differ).

```sh
@:/tmp/cloudcmd (dev) $ sudo iptables -t nat -D PREROUTING 1
@:/tmp/cloudcmd (dev) $ sudo iptables -t nat -D PREROUTING 2
```

To run Cloud Commander as daemon in linux you could set **log** to true in config and
do something like this:
    
    nohup node cloudcmd

Authorization
---------------
Cloud Commander could authorize clients on GitHub via openID.
All things that should be done is must be added **id** and **secret** of application
from github settings page and added to [modules.json](json/modules.json) (id just) and env variable (secret)
with names: *github_id*, *github_secret*, *dropbox_key*, *dropbox_secret* etc in
[secret.bat](shell/secret.bat) *(on win32)* or [secret.sh](shell/secret.sh) *(on nix)*.


Start
---------------
To start **Cloud Commander** only one command needed:
    
    node cloudcmd
or on win platform just

    cloudcmd
After thet Cloud Commander reads port information from config file [config.json](json/config.json#L17) and start server
on this port ( **8000** by default ), if none of port varibles ( *cloud9*, *cloudfoundry* and *nodester* ) isn't exist.
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

Additional modules
---------------
**Cloud Commander's Server Side** not using additional modules for main functionality.
But for minification and optimization tricks optional can be
assingned (and installed) modules: [Minify] (https://github.com/coderaiser/minify "Minify")
and [socket.io] (https://github.com/LearnBoost/socket.io "Socket.IO").

Install addtitional modules (type in **Cloud Commander** directory):

    npm i

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

[AceURL]:                   //ace.ajax.org/ "Ace"
[FancyBoxURL]:              //github.com/fancyapps/fancyBox "FancyBox"
[jQuery-contextMenuURL]:    //github.com/medialize/jQuery-contextMenu "jQuery-contextMenu"
[jq-consoleURL]:            //github.com/replit/jq-console‎ "jq-console"
[githubURL]:                //github.com/michael/github "github"
[dropbox-jsURL]:            //github.com/dropbox/dropbox-js "dropbox-js"
[jqueryURL]:                //jquery.com

Contributing
---------------
If you would like to contribute - send pull request to dev branch.
Getting dev version of **Cloud Commander**:

    git clone git://github.com/coderaiser/cloudcmd.git
    git checkout dev

It is possible thet dev version of Cloud Commander will needed dev version of Minify,
so to get it you should type a couple more commands:

    cd node_modules
    rm -rf minify
    git clone git://github.com/coderaiser/minify
    git checkout dev

Version history
---------------
- *2013.07.01*, **[v0.3.0](//github.com/coderaiser/cloudcmd-archive/raw/master/cloudcmd-v0.3.0.zip)**
- *2013.04.22*, **[v0.2.0](//github.com/coderaiser/cloudcmd-archive/raw/master/cloudcmd-v0.2.0.zip)**
- *2013.03.01*, **[v0.1.9](//github.com/coderaiser/cloudcmd-archive/raw/master/cloudcmd-v0.1.9.zip)**
- *2012.12.12*, **[v0.1.8](//github.com/coderaiser/cloudcmd-archive/raw/master/cloudcmd-v0.1.8.zip)**
- *2012.10.01*, **[v0.1.7](//github.com/coderaiser/cloudcmd-archive/raw/master/cloudcmd-v0.1.7.zip)**
- *2012.08.24*, **[v0.1.6](//github.com/coderaiser/cloudcmd-archive/raw/master/cloudcmd-v0.1.6.zip)**
- *2012.08.06*, **[v0.1.5](//github.com/coderaiser/cloudcmd-archive/raw/master/cloudcmd-v0.1.5.zip)**
- *2012.07.27*, **[v0.1.4](//github.com/coderaiser/cloudcmd-archive/raw/master/cloudcmd-v0.1.4.zip)**
- *2012.07.19*, **[v0.1.3](//github.com/coderaiser/cloudcmd-archive/raw/master/cloudcmd-v0.1.3.zip)**
- *2012.07.14*, **[v0.1.2](//github.com/coderaiser/cloudcmd-archive/raw/master/cloudcmd-v0.1.2.zip)**
- *2012.07.11*, **[v0.1.1](//github.com/coderaiser/cloudcmd-archive/raw/master/cloudcmd-v0.1.1.zip)**
- *2012.00.00*, **[v0.1.0](//github.com/coderaiser/cloudcmd-archive/raw/master/cloudcmd-v0.1.0.zip)**

License
---------------
MIT [license](LICENSE "license").

Special Thanks
---------------
[Elena Zalitok](http://vk.com/politilena "Elena Zalitok") for
[logo](img/logo/cloudcmd.png "logo") and [favicon](img/favicon/favicon.png "favicon").
