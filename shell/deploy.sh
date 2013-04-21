echo 'jitsu'
cp package.json tmp/package.json
echo 'y'|jitsu deploy
echo '://cloudcmd.jit.su'
cp tmp/package.json package.json
echo 'appfog'
af update
echo '://cloudcmd.aws.af.cm'
echo 'cloud foundry'
vmc push
echo '://cloudcmd.cloudfoundry.com'