#!/bin/sh
echo "jshint server.js client.js cloudcmd.js"
node_modules/jshint/bin/hint --config test/.jshintrc server.js client.js cloudcmd.js
echo "jshint lib/cloudfunc.js lib/client/keyBinding.js"
node_modules/jshint/bin/hint --config test/.jshintrc lib/util.js lib/cloudfunc.js node_modules/minify/minify.js lib/client/keyBinding.js
echo "lib/client/dom.js lib/client/ie.js lib/client/menu.js lib/client/socket.js ./lib/client/terminal.js lib/client/viewer.js lib/client/storage/_github.js lib/client/menu.js lib/client/editor/_codemirror.js"
node_modules/jshint/bin/hint --config test/.jshintrc lib/client/dom.js lib/client/ie.js lib/client/menu.js lib/client/socket.js ./lib/client/terminal.js lib/client/viewer.js lib/client/storage/_github.js lib/client/menu.js lib/client/editor/_codemirror.js
echo "jshint ./package.json ./config.json"
jshint ./package.json ./config.json
#linting css files
npm i recess
echo "recess css/*.css"
./node_modules/recess/bin/recess css/*.css
node test/test.js
node cloudcmd.js test
ls ./min