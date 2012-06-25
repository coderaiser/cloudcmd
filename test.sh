#!/bin/sh
npm install jshint
./node_modules/jshint/bin/jshint server.js --config .jshintrc
echo 'only warnings. no errors'