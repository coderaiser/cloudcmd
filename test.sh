#!/bin/sh
npm install -g jshint
jshint client.js --config .jshintrc_client
jshint server.js lib/*.js --config .jshintrc
echo 'only warnings. no errors'