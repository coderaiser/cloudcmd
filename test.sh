#!/bin/sh
npm i jshint
./node_modules/jshint/bin/hint --config ./.jshintrc ./server.js ./client.js ./lib/cloudfunc.js