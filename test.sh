#!/bin/bash
npm i -g jshint
jshint server.js --config .jshintrc
echo 'only warnings. no errors'