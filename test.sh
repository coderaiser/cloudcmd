#!/bin/sh
npm i jshint
./node_modules/jshint/bin/hint ./server.js ./lib/cloudfunc.js --config ./.jshintrc