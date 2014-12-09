(function() {
    'use strict';
    
    var repl    = require('repl'),
        net     = require('net');
    
    module.exports = net.createServer(function (socket) {
        var r = repl.start({
            prompt: '[' + process.pid + '] ' +socket.remoteAddress+':'+socket.remotePort+'> ',
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
