(function() {
    'use strict';
    
    var main            = global.cloudcmd.main,
        
        socket          = main.socket,
        spawn           = main.child_process.spawn,
        pty             = main.require('pty.js'),
        
        Util            = main.util,
        path            = main.path,
        mainpackage     = main.mainpackage,
        CLOUDCMD        = mainpackage.name,
        ClientDirs      = [],
        Clients         = [],
        WIN32           = main.WIN32,
        ConNum          = 0;
    /**
     * function listen on servers port
     * @pServer {Object} started server object
     */
    exports.init = function() {
        var ret;
        
        if (pty)
            ret = socket.on('connection', function(clientSocket) {
                onConnection(clientSocket, function(data) {
                    socket.emit('terminal-data', data, clientSocket);
                });
            });
        
        return ret;
    };
    
    function onConnection(clientSocket, callback) {
        var msg, onDisconnect, resizeFunc, dataFunc, term;
        
        ++ConNum;
        
        if (!Clients[ConNum]) {
            log(ConNum, 'terminal connected');
            
            term                        = getTerm(callback);
            dataFunc                    = onData.bind(null, term);
            resizeFunc                  = onResize.bind(null, term);
            
            onDisconnect                = function(conNum, term) {
                Clients[conNum]         = null;
                
                log(conNum, 'terminal disconnected');
                
                socket.removeListener('terminal-data', dataFunc, clientSocket);
                socket.removeListener('terminal-resize', resizeFunc, clientSocket);
                socket.removeListener('disconnect', onDisconnect, clientSocket);
            }.bind(ConNum, term);
            
            socket.on('terminal-data', dataFunc, clientSocket);
            socket.on('terminal-resize', resizeFunc, clientSocket);
            socket.on('disconnect', onDisconnect, clientSocket);
        } else {
            log(ConNum, ' in use. Reconnecting...\n');
            socket.disconnect();
        }
    }
    
    function onResize(term, size) {
        term.resize(size.cols, size.rows);
    }
    
    function onData(term, data) {
        term.write(data);
    }
    
    function getTerm(callback) {
        var term = pty.spawn('bash', [], {
            name: 'xterm-color',
            cols: 80,
            rows: 25,
            cwd : process.env.HOME,
            env : process.env
        });
        
        term.on('data', Util.exec.bind(Util, callback));
        
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
