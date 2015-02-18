(function() {
    'use strict';
    
    var net     = require('net'),
        repl    = require('repl'),
        rendy   = require('rendy');
    
    module.exports = net.createServer(function (socket) {
        var r = repl.start({
            prompt: rendy('[{{ pid }} {{ addr }}:{{ port}}>', {
                pid     : process.pid,
                addr    : socket.remoteAddress,
                port    : socket.remotePort
            }),
            input: socket,
            output: socket,
            terminal: true,
            useGlobal: false
        });
      
        r.on('exit', function () {
            socket.end();
        });
        
        r.context.socket = socket;
    }).listen(1337);
    
})();
