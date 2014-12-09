(function() {
    'use strict';
    
    var DIR_SERVER  = __dirname     + '/',
        DIR_LIB     = DIR_SERVER    + '../',
        
        path        = require('path'),
        Util        = require(DIR_LIB       + 'util'),
        CloudFunc   = require(DIR_LIB       + 'cloudfunc'),
        patch       = require(DIR_SERVER    + 'patch'),
        hash        = require(DIR_SERVER    + 'hash'),
        
        mellow      = require('mellow'),
        files       = require('files-io');
    
    module.exports          = function(sock) {
        Util.check(arguments, ['socket']);
        
        sock.of('/edit')
            .on('connection', function(socket) {
                socket.on('patch', function(name, data) {
                    var options = {
                            size: CloudFunc.MAX_FILE_SIZE
                        };
                        
                        name = mellow.convertPath(name);
                        
                        getHash(name, function(error, hash) {
                            if (error)
                                socket.emit('err', error.message);
                            else
                                patch(name, data, options, function(error) {
                                    var msg, baseName;
                                    
                                    if (error) {
                                        socket.emit('err', error.message);
                                    } else {
                                        baseName    = path.basename(name),
                                        msg         = CloudFunc.formatMsg('patch', baseName);
                                        
                                        socket.emit('message', msg);
                                        socket.broadcast.emit('patch', name, data, hash);
                                    }
                                });
                        });
                });
            });
    };
    
    function getHash(name, callback) {
        var error, hashStream = hash();
            
        if (!hashStream) {
            error   = 'hash: not suported, try update node';
            callback(Error(error));
        } else
            files.pipe(name, hashStream, function (error) {
                var hex;
                
                if (!error)
                    hex = hashStream.get();
                
                callback(error, hex);
            });
    }
})();
