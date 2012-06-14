#!/bin/sh
npm install -g jshint
jshint server.js --config .jshintrc
echo 'only warnings. no errors'