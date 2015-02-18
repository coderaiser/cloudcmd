(function() {
    'use strict';
    
    var DIR             = __dirname + '/../../',
        DIR_LIB         = DIR + 'lib/',
        
        Util            = require(DIR_LIB + 'util'),
        CloudFunc       = require(DIR_LIB + 'cloudfunc'),
        
        tryRequire      = require('tryrequire'),
        
        pty             = tryRequire('pty.js'),
        
        Clients         = [],
        
        CHANNEL         = CloudFunc.CHANNEL_TERMINAL,
        CHANNEL_RESIZE  = CloudFunc.CHANNEL_TERMINAL_RESIZE,
        
        ConNum          = 0;
        
    module.exports = function(socket) {
        Util.check(arguments, ['socket']);
        
        if (pty)
            socket
                .of('/terminal')
                .on('connection', function(socket) {
                    onConnection(socket, function(channel, data) {
                        socket.emit(channel, data);
                    });
                });
    };
    
    function onConnection(socket, callback) {
        var onDisconnect, resizeFunc, dataFunc, term;
        
        ++ConNum;
        
        if (!Clients[ConNum]) {
            log(ConNum, 'terminal connected');
            
            term                        = getTerm(callback);
            dataFunc                    = onData.bind(null, term);
            resizeFunc                  = onResize.bind(null, term, callback);
            
            onDisconnect                = function(conNum, term) {
                Clients[conNum]         = null;
                
                log(conNum, 'terminal disconnected');
                
                socket.removeListener(CHANNEL, dataFunc);
                socket.removeListener(CHANNEL_RESIZE, resizeFunc);
                socket.removeListener('disconnect', onDisconnect);
                
                term.destroy();
            }.bind(null, ConNum, term);
            
            socket.on(CHANNEL, dataFunc);
            socket.on(CHANNEL_RESIZE, resizeFunc);
            socket.on('disconnect', onDisconnect);
        } else {
            log(ConNum, ' in use. Reconnecting...\n');
            socket.disconnect();
        }
    }
    
    function onResize(term, callback, size) {
        term.resize(size.cols, size.rows);
        Util.exec(callback, CHANNEL_RESIZE, size);
    }
    
    function onData(term, data) {
        term.write(data);
    }
    
    function getTerm(callback) {
        var onData      = Util.exec.bind(Util, callback, CHANNEL),
            
            term        = pty.spawn('bash', [], {
                name: 'xterm-color',
                cols: 80,
                rows: 25,
                cwd : DIR,
                env : process.env
            });
        
        term.on('data', onData);
        
        return term;
    }
    
    function log(pConnNum, pStr, pType) {
        var lRet,
            lType       = ' ';
        
        if (pStr) {
            
            if (pType)
                lType  += pType + ':';
            
            lRet        = 'client #' + pConnNum + lType + pStr;
            
            console.log(lRet);
        }
        
        return lRet;
    }
})();
