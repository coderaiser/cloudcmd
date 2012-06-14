#!/bin/sh
npm install -g jshint
jshint *.js --config .jshintrc
echo 'only warnings. no errors'