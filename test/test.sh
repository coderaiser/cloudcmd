#!/bin/sh
npm i jshint -g
echo "jshint server.js client.js lib/cloudfunc.js"
jshint --config ./.jshintrc ./server.js ./client.js 
echo "jshint ./lib/cloudfunc.js ./lib/server/minify.js ./lib/client/keyBinding.js"
jshint --config ./.jshintrc ./lib/cloudfunc.js ./lib/server/minify.js ./lib/client/keyBinding.js
gem install vmc
vmc target api.cloudfoundry.com
vmc target
echo 'cloudcmd-demo@ukr.net\nGW14dXlm'|vmc login
vmc info
vmc push