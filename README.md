Cloud Commander [![Build Status](https://secure.travis-ci.org/coderaiser/cloudcmd.png?branch=master)](http://travis-ci.org/coderaiser/cloudcmd)
=============== 
**Cloud Commander** - two-panels file manager, totally writed on js.
View [demo](http://cloudcmd.cloudfoundry.com/ "demo").
PageSpeed Score of [97](https://developers.google.com/speed/pagespeed/insights#url=http_3A_2F_2Fcloudcmddemo.cloudfoundry.com_2F&mobile=false "score") (out of 100).

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