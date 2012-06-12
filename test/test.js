var util = require('util'),
    exec = require('child_process').exec;

            

exec('curl http://phantomjs.googlecode.com/files/phantomjs-1.5.0-linux-x86-dynamic.tar.gz',makeExecFunctoin(_1));

var _1 = function(){exec('tar -zxf phantomjs-1.5.0-linux-x86-dynamic.tar.gz',makeExecFunctoin(_2));}
var _2 = function(){exec('./phantomjs/bin/phantomjs',makeExecFunctoin(_3));};
var _3 = function(){exec('ls',makeExecFunctoin());};
var i;
function makeExecFunctoin(pFunc){
    return function(error, stdout, stderr) {
        console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);
        
        if (error !== null) {
            console.log('exec error: ' + error);
        }
        else if(pFunc && 
            typeof pFunc==='function'){
                    console.log(i++);
                    pFunc();
                }
    };
}