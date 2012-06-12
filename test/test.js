var util = require('util'),
    exec = require('child_process').exec,
    child;

            

exec('curl http://phantomjs.googlecode.com/files/phantomjs-1.5.0-linux-x86-dynamic.tar.gz',execFunctoin);
exec('tar -zxf phantomjs-1.5.0-linux-x86-dynamic.tar.gz',execFunctoin);
exec('./phantomjs/bin/phantomjs',execFunctoin);

function execFunctoin(error, stdout, stderr) {
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    
    if (error !== null) {
        console.log('exec error: ' + error);
    }
}