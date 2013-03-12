Cloud Commander v0.2.0 [![Dependency Status][DependencyStatusIMGURL]][DependencyStatusURL] [![Build Status][BuildStatusIMGURL]][BuildStatusURL]
===============
[BuildStatusIMGURL]:        https://secure.travis-ci.org/coderaiser/cloudcmd.png?branch=dev
[DependencyStatusIMGURL]:   https://gemnasium.com/coderaiser/cloudcmd.png
[BuildStatusURL]:           http://travis-ci.org/coderaiser/cloudcmd  "Build Status"
[DependencyStatusURL]:      https://gemnasium.com/coderaiser/cloudcmd "Dependency Status"
**Cloud Commander** - user friendly cloud file manager.
DEMO:
[cloudfoundry] (http://cloudcmd.cloudfoundry.com "cloudfoundry"),
[appfog] (http://cloudcmd.aws.af.cm "appfog").

Google PageSpeed Score : [100](http://developers.google.com/speed/pagespeed/insights#url=http_3A_2F_2Fcloudcmd.cloudfoundry.com_2F&mobile=false "score") (out of 100)
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
- **up, down, enter**   - filesystem navigation
- **Tab**               - move thru panels
- **Page Up**           - up on one page
- **Page Down**         - down on one page
- **Home**              - to begin of list
- **End**               - to end of list
- **Shift + F10**       - show context menu
- **F2**                - rename current file
- **Alt + g**           - authorization in GitHub

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

PORTS
---------------
Standard practices say no non-root process gets to talk to
the Internet on a port less than 1024. Anyway I suggest you
to start Cloud Commander as non-root. How it could be soulved?
There is a couple easy and fast ways. One of them is port forwarding by iptables.
```
iptables -t nat -L # look rules before
@:/tmp/cloudcmd (dev) $ iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-ports 8000
@:/tmp/cloudcmd (dev) $ iptables -t nat -A PREROUTING -p tcp --dport 443 -j REDIRECT --to-ports 4430
iptables -t nat -L # look reles after
```
You should see somethins like this (8000 and 4430 should be in config as port and sslPort)
```
target     prot opt source               destination
REDIRECT   tcp  --  anywhere             anywhere             tcp dpt:http redir ports 8000
REDIRECT   tcp  --  anywhere             anywhere             tcp dpt:https redir ports 4430

```
If you would want to get things back just clear rules (1 and 2 it's rules numbers,
in your list they could differ).

```
iptables -t nat -D PREROUTING 1
iptables -t nat -D PREROUTING 2
```



Documentation
---------------
JS Doc documentation could be found in [http://jsdoc.info/coderaiser/cloudcmd/](http://jsdoc.info/coderaiser/cloudcmd/)

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

Special Thanks
---------------
[Elena Zalitok](http://vk.com/politilena "Elena Zalitok")  for logo.
