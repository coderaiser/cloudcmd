#!/bin/sh
npm i -g jshint
echo "jshint server.js client.js lib/cloudfunc.js"
hint --config ./.jshintrc ./server.js ./client.js ./lib/cloudfunc.js