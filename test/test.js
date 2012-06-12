var util = require('util'),
    exec = require('child_process').exec,
    child;

var lScript='curl http://phantomjs.googlecode.com/files/phantomjs-1.5.0-linux-x86-dynamic.tar.gz &&' +
            'tar -zxf phantomjs-1.5.0-linux-x86-dynamic.tar.gz'+
            './phantomjs/bin/phantomjs';

child = exec(lScript,
  function (error, stdout, stderr) {
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if (error !== null) {
      console.log('exec error: ' + error);
    }
});