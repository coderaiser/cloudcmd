#!/bin/sh
npm install -g jshint
jshint *.js lib/*.js --config .jshintrc
echo 'only warnings. no errors'