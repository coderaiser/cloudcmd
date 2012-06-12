var util = require('util'),
    exec = require('child_process').exec,
    child;

child = exec('cd test && chmod +x test.sh && test.sh',
  function (error, stdout, stderr) {
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if (error !== null) {
      console.log('exec error: ' + error);
    }
});