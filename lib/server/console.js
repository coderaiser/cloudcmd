(function() {
    'use strict';
    
    var DIR             = '../',
        DIR_SERVER      = './',
        
        Util            = require(DIR           + 'util'),
        CloudFunc       = require(DIR           + 'cloudfunc'),
        
        socket          = require(DIR_SERVER    + 'socket'),
        spawnify        = require(DIR_SERVER    + 'spawnify'),
        
        Clients         = [],
        addNewLine      = CloudFunc.addNewLine,
        
        ConNum          = 0,
        
        CWD             = process.cwd(),
        
        CHANNEL         = CloudFunc.CHANNEL_CONSOLE;
    
    module.exports = function(io, onMsg) {
        socket.on('connection', io, function(clientSocket) {
            onConnection(clientSocket, onMsg, function(error, json) {
                socket.emit(CHANNEL, json, clientSocket);
            });
        });
    };
    
    function onConnection(clientSocket, onMsg, callback) {
        var msg, onDisconnect, onMessage;
        
        if (!callback) {
            callback    = onMsg;
            onMsg       = null;
        }
        
        Util.checkArgs([clientSocket, callback], ['clientSocket', 'callback']);
        
        ++ConNum;
        
        if (!Clients[ConNum]) {
            msg = log(ConNum, 'console connected');
            
            if (onMsg)
                onMsg('cd .', callback);
            else
                callback(null, {
                    stdout  : addNewLine(msg),
                    path    : CWD
                });
            
            Clients[ConNum] = {
                cwd : CWD
            },
            
            onMessage                   = function(command) {
                log(ConNum, command);
                
                if (onMsg)
                    onMsg(command, callback);
                else
                    spawnify(command, Clients[ConNum], callback);
            },
            onDisconnect                = function(conNum) {
                Clients[conNum]         = null;
                
                log(conNum, 'console disconnected');
                
                socket.removeListener(CHANNEL, clientSocket, onMessage);
                socket.removeListener('disconnect', clientSocket, onDisconnect);
            }.bind(null, ConNum);
            
            socket.on(CHANNEL, clientSocket, onMessage);
            socket.on('disconnect', clientSocket, onDisconnect);
        } else {
            msg = log(ConNum, ' in use. Reconnecting...\n');
            
            callback(null, {
                stdout: msg
            });
            
            socket.disconnect();
        }
    }
    
    function log(connNum, str, typeParam) {
        var ret, 
            type       = ' ';
        
        if (str) {
            
            if (typeParam)
                type  += typeParam + ':';
            
            ret        = 'client #' + connNum + type + str;
            
            Util.log(ret);
        }
        
        return ret;
    }
})();
