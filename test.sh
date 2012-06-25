#!/bin/sh
npm i jshint
echo "jshint server.js client.js lib/cloudfunc.js"
./node_modules/jshint/bin/hint --config ./.jshintrc ./server.js ./client.js ./lib/cloudfunc.js