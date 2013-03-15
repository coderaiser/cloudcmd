cd ..
echo 'jitsu'
cp package.json tmp/package.json
jitsu deploy
echo '://cloudcmd.jit.su'
cp tmp/package.json package.json
echo 'appfog'
af update
echo '://cloudcmd.aws.af.cm'
echo 'cloud foundry'
vmc update
echo '://cloudcmd.cloudfoundry.com'
echo 'nodester'
git push nodester master
echo 'heroku'
git push heroku master
cd shell