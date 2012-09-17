#!/bin/sh
#linting js files
npm i jshint
echo "jshint server.js client.js cloudcmd.js"
./node_modules/jshint/bin/hint --config ./test/.jshintrc ./server.js ./client.js ./cloudcmd.js
echo "jshint lib/cloudfunc.js lib/client/keyBinding.js"
./node_modules/jshint/bin/hint --config ./test/.jshintrc ./lib/cloudfunc.js ./node_modules/minify/minify.js ./lib/client/keyBinding.js
echo "jshint ./package.json ./config.json"
./node_modules/jshint/bin/hint --config ./test/.jshintrc ./package.json ./config.json
#linting css files
npm i recess
echo "recess css/*.css"
./node_modules/recess/bin/recess css/*.css
node ./test/test.js
node cloudcmd.js test
ls ./min