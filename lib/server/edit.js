(function() {
    'use strict';
    
    var DIR_SERVER  = __dirname     + '/',
        DIR_LIB     = DIR_SERVER    + '../',
        
        path        = require('path'),
        Util        = require(DIR_LIB       + 'util'),
        CloudFunc   = require(DIR_LIB       + 'cloudfunc'),
        patch       = require(DIR_SERVER    + 'patch');
    
    module.exports          = function(sock) {
        Util.check(arguments, ['socket']);
        
        sock.of('/config')
            .on('connection', function(socket) {
                socket.on('patch', function(data) {
                    var options = {
                        size: CloudFunc.MAX_FILE_SIZE
                    };
                    
                    patch(name, data, options, function(error) {
                        var baseName    = path.basename(name),
                            msg         = CloudFunc.formatMsg('patch', baseName);
                        
                        if (error)
                            socket.emit('err', error);
                        else
                            socket.emit('message', msg);
                    });
                });
            });
    };
})();
