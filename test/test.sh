#!/bin/sh
npm i recess jshint
echo "jshint lib/*.js lib/client/*.js lib/client/storage/*.js lib/server/*.js"
node_modules/jshint/bin/jshint --config test/.jshintrc lib/*.js `ls lib/client/*.js| grep -v jquery` lib/client/storage/*.js lib/server/*.js
echo "jshint package.json json/*.json"
node_modules/jshint/bin/jshint --config test/.jshintrc package.json json/*.json
#linting css files
echo "recess css/*.css"
./node_modules/recess/bin/recess css/*.css
node test/test.js
node cloudcmd.js test
