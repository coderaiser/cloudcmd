#!/bin/sh
npm i recess jshint
echo "jshint server.js client.js cloudcmd.js"
node_modules/jshint/bin/jshint --config test/.jshintrc lib/server.js lib/client.js cloudcmd.js
echo "jshint lib/cloudfunc.js lib/client/keyBinding.js"
node_modules/jshint/bin/jshint --config test/.jshintrc lib/util.js lib/cloudfunc.js lib/client/key.js
echo "lib/client/dom.js lib/client/ie.js lib/client/menu.js lib/client/socket.js ./lib/client/terminal.js lib/client/viewer.js lib/client/storage/_github.js lib/client/menu.js lib/client/editor/_codemirror.js"
node_modules/jshint/bin/jshint --config test/.jshintrc lib/client/dom.js lib/client/polyfill.js lib/client/menu.js lib/client/socket.js ./lib/client/console.js lib/client/view.js lib/client/storage/_github.js lib/client/menu.js lib/client/edit.js
echo "jshint ./package.json ./json/config.json"
node_modules/jshint/bin/jshint --config test/.jshintrc ./package.json ./json/config.json
#linting css files
echo "recess css/*.css"
./node_modules/recess/bin/recess css/*.css
node test/test.js
node cloudcmd.js test
