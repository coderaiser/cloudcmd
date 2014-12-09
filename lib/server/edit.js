(function() {
    'use strict';
    
    var DIR_SERVER  = __dirname     + '/',
        DIR_LIB     = DIR_SERVER    + '../',
        
        path        = require('path'),
        fs          = require('fs'),
        
        Util        = require(DIR_LIB       + 'util'),
        CloudFunc   = require(DIR_LIB       + 'cloudfunc'),
        patch       = require(DIR_SERVER    + 'patch'),
        ashify      = require('ashify'),
        
        mellow      = require('mellow');
    
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
        var stream  = fs.createReadStream(name),
            options = {
                algorithm: 'sha1',
                encoding: 'hex'
            };
        
        ashify(stream, options, callback);
    }
})();
