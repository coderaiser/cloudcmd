#!/bin/sh
npm i recess jshint
echo "jshint lib: server.js, client.js, cloudcmd.js, server/*.js"
node_modules/jshint/bin/jshint --config test/.jshintrc lib/server.js lib/client.js cloudcmd.js lib/server/*.js
echo "jshint lib/cloudfunc.js lib/client/key.js"
node_modules/jshint/bin/jshint --config test/.jshintrc lib/util.js lib/cloudfunc.js lib/client/key.js
echo "jshint lib/client: dom.js, polyfill.js, menu.js, socket.js, console.js, view.js storage/_github.js, edit.js"
node_modules/jshint/bin/jshint --config test/.jshintrc lib/client/dom.js lib/client/polyfill.js lib/client/menu.js lib/client/socket.js ./lib/client/console.js lib/client/view.js lib/client/storage/_github.js lib/client/edit.js
echo "jshint ./package.json ./json/config.json ./json/modules.json"
node_modules/jshint/bin/jshint --config test/.jshintrc ./package.json ./json/config.json ./json/modules.json
#linting css files
echo "recess css/*.css"
./node_modules/recess/bin/recess css/*.css
node test/test.js
node cloudcmd.js test
