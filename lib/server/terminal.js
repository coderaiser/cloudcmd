(function() {
    'use strict';
    
    var DIR             = __dirname + '/../../',
        DIR_LIB         = DIR + 'lib/',
       
        socket          = require('./socket'),
        
        Util            = require(DIR_LIB + 'util'),
        CloudFunc       = require(DIR_LIB + 'cloudfunc'),
        
        tryRequire      = require('./tryRequire.js'),
        
        pty             = tryRequire('pty.js', function(error) {
            if (error)
                Util.log(error.message);
        }),
        Clients         = [],
        
        CHANNEL         = CloudFunc.CHANNEL_TERMINAL,
        CHANNEL_RESIZE  = CloudFunc.CHANNEL_TERMINAL_RESIZE,
        
        ConNum          = 0;
        
    module.exports = function(io) {
        var makePty     = function(clientSocket) {
                onConnection(clientSocket, function(channel, data) {
                    socket.emit(channel, data, clientSocket);
                });
            };
        
        if (pty)
            socket.on('connection', io, makePty);
    };
    
    function onConnection(clientSocket, callback) {
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
                
                socket.removeListener(CHANNEL, clientSocket, dataFunc);
                socket.removeListener(CHANNEL_RESIZE, clientSocket, resizeFunc);
                socket.removeListener('disconnect', clientSocket, onDisconnect);
                
                term.destroy();
            }.bind(null, ConNum, term);
            
            socket.on(CHANNEL, clientSocket, dataFunc);
            socket.on(CHANNEL_RESIZE, clientSocket, resizeFunc);
            socket.on('disconnect', clientSocket, onDisconnect);
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
            
            Util.log(lRet);
        }
        
        return lRet;
    }
})();
