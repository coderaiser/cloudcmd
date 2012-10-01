Cloud Commander [![Build Status](https://secure.travis-ci.org/coderaiser/cloudcmd.png?branch=master)](http://travis-ci.org/coderaiser/cloudcmd)
=============== 
**Cloud Commander** - two-panels file manager, totally writed on js.
View [demo](http://cloudcmd.jit.su/ "demo"), [mirror on nodester](http://cloudcmd.nodester.com/ "mirror on nodester")

Google PageSpeed Score : [100](https://developers.google.com/speed/pagespeed/insights#url=http_3A_2F_2Fdemo-cloudcmd.cloudfoundry.com_2F&mobile=false "score") (out of 100).

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
- only 1 panel available
- no keybinding
- no local caching
- full loading of all web page(with styles, js-scripts, html-page etc).

Hot keys
---------------
In all modern web browsers (but not in IE, becouse he special) hot keys works.
There is a short list:
- Ctrl + r          - reload dir content
- Ctrl + d          - clear local cache (wich contains dir contents)
- Alt  + q          - disable key bindings
- Alt  + s          - get all key bindings back
- up, down, enter   - filesystem navigation

Viewer's hot keys
---------------
- Shift + F3      - open viewer window
- Esc               - close viewer window

Editor's hot keys
---------------
- F3                - open CodeMirror editor in read only mode
- F4                - open CodeMirror editor
- Esc               - close CodeMirror editor

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
    "cache" : {"allowed" : true},   /* cashing of js and css files in memory    */
    "minification" : {              /* minification of js,css,html and img      */
        "js"    : false,            /* minify module neaded                     */
        "css"   : false,            /* npm i minify                             */
        "html"  : true,
        "img"   : false
    },
    "server"    : true,             /* server mode or testing mode              */
    "logs"      : false,            /* logs or console ouput                    */
    "port"      : 31337,            /* Cloud Commander port                     */
    "ip"        : "127.0.0.1"       /* Cloud Commander IP                       */
}
```
Starting
---------------
To start **Cloud Commander** only one command neaded:
    
    node cloudcmd
or on win platform just

    cloudcmd
After thet Cloud Commander reads config file **config.json** and start server
on 31337 port, if none of port varibles(*cloud9*, *cloudfoundry* and *nodester*)
isn't exist.
Then type in browser

    http://127.0.0.1:31337
or

    http://localhost:31337
Updating
---------------
**Cloud Commander** is very buggy and alfa so it's very often updated. For update
you can just type in cloudcmd directory:

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
    
**Cloud Commander's Client Side** use module jquery for ajaxing.
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
- [CodeMirror] (http://codemirror.net "CodeMirror")
- [FancyBox] (https://github.com/fancyapps/fancyBox "FancyBox")
- [jQuery-contextMenu] (https://github.com/medialize/jQuery-contextMenu "jQuery-contextMenu")
- [jquery.terminal] (https://github.com/jcubic/jquery.terminal "jquery.terminal")

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