Cloud Commander [![Build Status](https://secure.travis-ci.org/coderaiser/cloudcmd.png?branch=master)](http://travis-ci.org/coderaiser/cloudcmd)
=============== 
**Cloud Commander** - two-panels file manager, totally writed on js.
View [demo](http://demo-cloudcmd.cloudfoundry.com/ "demo"), [mirror](http://cloudcmd.nodester.com/ "mirror").

Google PageSpeed Score : [100](https://developers.google.com/speed/pagespeed/insights#url=http_3A_2F_2Fdemo-cloudcmd.cloudfoundry.com_2F&mobile=false "score") (out of 100).

Benefits
---------------
- full browser compatibility *(ie6+,chrome,safari,opera,firefox)*;
- responsible design
- one full page loading, *and then just one-time json-dir-listings loading
(with refresh opportunity).*
- caching readed directories *to localStorage (for now)
(so if network will disconnected or something heppen with a signal, we
definitely will can work cached copy of directory listings)*;
- key binding
- disabled js support *(working in limited mode)*.
- automated minification *client js-files and onstart-reading Cloud manager files on server starting.*

**Cloud Commander** uses all benefits of js, so if js is disabled,
we moves to *limited mode*.

Limited-mode features:
---------------
- only 1 panel available
- no keybinding
- no local caching
- full loading of all web page(with styles, js-scripts, html-page etc).

Hot keys:
---------------
In all modern web browsers (but not in IE, becouse he special) hot keys works.
There is a short list:
- Ctrl + r          - reload dir content
- Ctrl + d          - clear local cache (wich contains dir contents)
- Alt  + q          - disable key bindings
- Alt  + s          - get all key bindings back
- up, down, enter   - filesystem navigation

Installing
---------------
**Cloud Commander** installing is very easy. All you need it's just clone
repository from github. Install and start, just 3 commands:

    git clone git://github.com/coderaiser/cloudcmd.git
    cd cloudcmd
    node server.js

Updating
---------------
**Cloud Commander** is very buggy and alfa so it's very often updated. For update
you can just type in cloudcmd directory:

    git pull

Additional modules:
---------------
**Cloud Commander's Server Side** not using additional modules for main functionality.
But for minification and optimization tricks optional can be
assingned (and installed) module: [Minify] (https://github.com/coderaiser/minify "Minify").

Install addtitional modules:

    git submodule init
    git submodule update
    
**Cloud Commander's Client Side** use module jquery for ajaxing.
We could not use this module, but this way is fast:
- google cdn
- gzip
- cache

Perhaps in the future, it will not be used, but so far it has no effect on
start loading of Cloud Commander Client Side and do things fast and stable
it is using now.