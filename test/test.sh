#!/bin/sh
#linting js files
npm i jshint -g
echo "jshint server.js client.js lib/cloudfunc.js"
jshint --config ./.jshintrc ./server.js ./client.js 
echo "jshint ./lib/cloudfunc.js ./lib/server/minify/minify.js ./lib/client/keyBinding.js"
jshint --config ./.jshintrc ./lib/cloudfunc.js ./lib/server/minify/minify.js ./lib/client/keyBinding.js
echo "jshint ./package.json ./config.json"
jshint --config ./.jshintrc ./package.json ./config.json
npm i uglify-js clean-css html-minifier css-b64-images
#linting css files
npm i recess -g
echo "recess ./css/*.css"
recess css/*.css
node server.js test
ls ./min