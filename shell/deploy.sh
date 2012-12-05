echo 'appfog'
af update
echo 'http://cloudcmd.aws.af.cm/'
echo 'cloud foundry'
vmc update
echo 'http://cloudcmd.cloudfoundry.com/'
echo 'nodester'
git push nodester master
echo 'heroku'
git push heroku master