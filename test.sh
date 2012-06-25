#!/bin/sh
npm install jshint
./node_modules/jshint/bin/hint ./server.js --config .jshintrc
echo 'only warnings. no errors'