Cloud Commander v0.2.0 [![NPM version][NPMIMGURL]][NPMURL] [![Dependency Status][DependencyStatusIMGURL]][DependencyStatusURL] [![Build Status][BuildStatusIMGURL]][BuildStatusURL]
===============
[![Flattr][FlattrIMGURL]][FlattrURL]
[NPMIMGURL]:                https://badge.fury.io/js/cloudcmd.png
[BuildStatusIMGURL]:        https://secure.travis-ci.org/coderaiser/cloudcmd.png?branch=master
[DependencyStatusIMGURL]:   https://gemnasium.com/coderaiser/cloudcmd.png
[FlattrIMGURL]:             http://api.flattr.com/button/flattr-badge-large.png
[NPMURL]:                   http://badge.fury.io/js/cloudcmd
[BuildStatusURL]:           http://travis-ci.org/coderaiser/cloudcmd  "Build Status"
[DependencyStatusURL]:      https://gemnasium.com/coderaiser/cloudcmd "Dependency Status"
[FlattrURL]:                https://flattr.com/submit/auto?user_id=coderaiser&url=github.com/coderaiser/cloudcmd&title=cloudcmd&language=&tags=github&category=software

**Cloud Commander** - user friendly cloud file manager.
DEMO:
[cloudfoundry] (https://cloudcmd.cloudfoundry.com "cloudfoundry"),
[appfog] (https://cloudcmd.aws.af.cm "appfog"),
[jitsu] (https://cloudcmd.jit.su "jitsu").

Google PageSpeed Score : [100](//developers.google.com/speed/pagespeed/insights#url=http_3A_2F_2Fcloudcmd.aws.af.cm_2F&mobile=false "score") (out of 100)
(or 96 if js or css minification disabled in config.json).

![Cloud Commander](img/logo/cloudcmd.png "Cloud Commander")

Benefits
---------------
- full browser compatibility *(ie6+,chrome,safari,opera,firefox)*;
- responsible design
- one full page loading, *and then just one-time json-dir-listings loading
(with refresh opportunity).*
- caching readed directories *to localStorage (for now)
(so if network will disconnected or something heppen with a signal, we
definitely will can work with cached copy of directory listings)*;
- key binding
- disabled js support *(working in limited mode)*.
- automated minification *client js-files and onstart-reading Cloud manager files on server starting.*

**Cloud Commander** uses all benefits of js, so if js is disabled,
we moves to *limited mode*.

Limited-mode features
---------------
- no keybinding
- no local caching
- full loading of all web page(with styles, js-scripts, html-page etc).

Hot keys
---------------
In all modern web browsers (but not in IE, becouse he special) hot keys works.
There is a short list:
- **Ctrl + r**          - reload dir content
- **Ctrl + d**          - clear local cache (wich contains dir contents)
- **Alt  + q**          - disable key bindings
- **Alt  + s**          - get all key bindings back
- **Ctrl + A**          - select all files in a panel
- **up, down, enter**   - filesystem navigation
- **Tab**               - move thru panels
- **Page Up**           - up on one page
- **Page Down**         - down on one page
- **Home**              - to begin of list
- **End**               - to end of list
- **F8, Delete**        - remove current file
- **Shift + Delete**    - remove without prompt
- **Insert**            - select current file
- **F2**                - rename current file
- **Shift + F10**       - show context menu

Viewer's hot keys
---------------
- **Shift + F3**        - open viewer window
- **Esc**               - close viewer window

Editor's hot keys
---------------
- **F3**                - open CodeMirror editor in read only mode
- **F4**                - open CodeMirror editor
- **Ctrl + s**          - save file
- **Esc**               - close CodeMirror editor

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

Installing
---------------
**Cloud Commander** installing is very easy. All you need it's just clone
repository from github. Just 2 commands:

    git clone git://github.com/coderaiser/cloudcmd.git
    cd cloudcmd
or

    npm i cloudcmd
    mv node_modules/cloudcmd ./

Configuration
---------------
All main configuration could be done thrue config.json.
```js
{
    "api_url"   :"/api/v1",
    "appcache"  : false,            /* html5 feature appcache                   */
    "cache"     : true,             /* cashing on a client                      */
    "minification" : {              /* minification of js,css,html and img      */
        "js"    : false,            /* minify module neaded                     */
        "css"   : false,            /* npm i minify                             */
        "html"  : true,
        "img"   : false
    },
    "show_keys_panel" : true,       /* show classic panel with buttons of keys  */
    "server"    : true,             /* server mode or testing mode              */
    "logs"      : false,            /* logs or console ouput                    */
    "socket"    : true              /* enable web sockets                       */
    "port"      : 80,               /* http port                                */
    "sslPort"   : 443,              /* https port                               */
    "ip"        : "127.0.0.1",      /* Cloud Commander IP                       */
    "ssl"       : true              /* should use https?                        */
    "rest"      : true              /* enable rest interface                    */
}
```

Server
---------------
Standard practices say no non-root process gets to talk to
the Internet on a port less than 1024. Anyway I suggest you
to start Cloud Commander as non-root. How it could be solved?
There is a couple easy and fast ways. One of them is port forwarding by iptables.

```sh
@:/tmp/cloudcmd (dev) $ su iptables -t nat -L # look rules before
@:/tmp/cloudcmd (dev) $ su iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-ports 8000
@:/tmp/cloudcmd (dev) $ su iptables -t nat -A PREROUTING -p tcp --dport 443 -j REDIRECT --to-ports 4430
@:/tmp/cloudcmd (dev) $ su iptables -t nat -L # look reles after
```
You should see somethins like this ( **8000** and **4430** should be in config as **port** and **sslPort** )

    target     prot opt source               destination
    REDIRECT   tcp  --  anywhere             anywhere             tcp dpt:http redir ports 8000
    REDIRECT   tcp  --  anywhere             anywhere             tcp dpt:https redir ports 4430

If you would want to get things back just clear rules ( **1** and **2** it's rules numbers,
in your list they could differ).

```sh
@:/tmp/cloudcmd (dev) $ su iptables -t nat -D PREROUTING 1
@:/tmp/cloudcmd (dev) $ su iptables -t nat -D PREROUTING 2
```

To run Cloud Commander as daemon in linux you could set **log** to true in config and
do something like this:
    
    nohup node cloudcmd

Authorization
---------------
Thru openID Cloud Commander could authorize clients on GitHub.
All things that should be done is must be added **id** and **secret** of application
from github settings page and added to **config.json** (id just) and env varible (secret)
with names: *github_id*, *github_secret*, *dropbox_key*, *dropbox_secret* etc.
For more information see **config.json** and **shell/seret.bat** *(on win32)*
or **shell/secret.sh** *(on nix)*.


Starting
---------------
To start **Cloud Commander** only one command neaded:
    
    node cloudcmd
or on win platform just

    cloudcmd
After thet Cloud Commander reads config file **config.json** and start server
on 80 port, if none of port varibles(*cloud9*, *cloudfoundry* and *nodester*)
isn't exist.
Then type in browser

    http://127.0.0.1
or

    http://localhost
Updating
---------------
**Cloud Commander** is very alfa and it's very often updatings.
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

Install addtitional modules:

    npm i
    
**Cloud Commander's Client Side** use module jquery for ajaxing. But only for old browsers.
We could not use this module, but this way is fast:
- google cdn
- gzip
- cache

Perhaps in the future, it will not be used, but so far it has no effect on
start loading of Cloud Commander Client Side and do things fast and stable
it is using now.

Extensions
---------------
**Cloud Commander** desinged to easily porting extensions.
For extend main functionality Cloud Commander use next modules:
- [CodeMirror]              [CodeMirrorURL]
- [FancyBox]                [FancyBoxURL]
- [jQuery-contextMenu]      [jQuery-contextMenuURL]
- [jquery.terminal]         [jquery.terminalURL]
- [github]                  [githubURL]
- [dropbox-js]              [dropbox-jsURL]

[CodeMirrorURL]:            //github.com/marijnh/CodeMirror "CodeMirror"
[FancyBoxURL]:              //github.com/fancyapps/fancyBox "FancyBox"
[jQuery-contextMenuURL]:    //github.com/medialize/jQuery-contextMenu "jQuery-contextMenu"
[jquery.terminalURL]:       //github.com/jcubic/jquery.terminal "jquery.terminal"
[githubURL]:                //github.com/michael/github
[dropbox-jsURL]:            //github.com/dropbox/dropbox-js

Contributing
---------------
If you would like to contribute - send pull request to dev branch.
Getting dev version of **Cloud Commander**:

    git clone git://github.com/coderaiser/cloudcmd.git
    git checkout dev

It is possible thet dev version Cloud Commander will needed dev version of Minify,
so to get it you should type a couple more commands:

    cd node_modules
    rm -rf minify
    git clone git://github.com/coderaiser/minify
    git checkout dev

Version history
---------------
- *2012.04.22*, **[v0.2.0](//github.com/coderaiser/cloudcmd-archive/raw/master/cloudcmd-v0.2.0.zip)**
- *2012.03.01*, **[v0.1.9](//github.com/coderaiser/cloudcmd-archive/raw/master/cloudcmd-v0.1.9.zip)**
- *2012.12.12*, **[v0.1.8](//github.com/coderaiser/cloudcmd-archive/raw/master/cloudcmd-v0.1.8.zip)**
- *2012.10.01*, **[v0.1.7](//github.com/coderaiser/cloudcmd-archive/raw/master/cloudcmd-v0.1.7.zip)**
- *2012.08.24*, **[v0.1.6](//github.com/coderaiser/cloudcmd-archive/raw/master/cloudcmd-v0.1.6.zip)**
- *2012.08.06*, **[v0.1.5](//github.com/coderaiser/cloudcmd-archive/raw/master/cloudcmd-v0.1.5.zip)**
- *2012.07.27*, **[v0.1.4](//github.com/coderaiser/cloudcmd-archive/raw/master/cloudcmd-v0.1.4.zip)**
- *2012.07.19*, **[v0.1.3](//github.com/coderaiser/cloudcmd-archive/raw/master/cloudcmd-v0.1.3.zip)**
- *2012.07.14*, **[v0.1.2](//github.com/coderaiser/cloudcmd-archive/raw/master/cloudcmd-v0.1.2.zip)**
- *2012.07.11*, **[v0.1.1](//github.com/coderaiser/cloudcmd-archive/raw/master/cloudcmd-v0.1.1.zip)**
- *2012.00.00*, **[v0.1.0](//github.com/coderaiser/cloudcmd-archive/raw/master/cloudcmd-v0.1.0.zip)**

Special Thanks
---------------
[Elena Zalitok](http://vk.com/politilena "Elena Zalitok")  for logo.
