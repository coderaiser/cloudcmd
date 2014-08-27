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
    
    module.exports = function() {
        socket.on('connection', function(clientSocket) {
            onConnection(clientSocket, function(error, json) {
                socket.emit(CHANNEL, json, clientSocket);
            });
        });
    };
    
    function onConnection(clientSocket, callback) {
        var msg, onDisconnect, onMessage;
        
        ++ConNum;
        
        Util.checkArgs(arguments, ['clientSocket', 'callback']);
        
        if (!Clients[ConNum]) {
            msg = log(ConNum, 'console connected');
            
            callback(null, {
                stdout  : addNewLine(msg),
                path    : CWD
            });
            
            Clients[ConNum] = {
                cwd : CWD
            },
            
            onMessage                   = function(command) {
                log(ConNum, command);
                spawnify(command, Clients[ConNum], callback);
            },
            onDisconnect                = function(conNum) {
                Clients[conNum]         = null;
                
                log(conNum, 'console disconnected');
                
                socket.removeListener(CHANNEL, onMessage, clientSocket);
                socket.removeListener('disconnect', onDisconnect, clientSocket);
            }.bind(null, ConNum);
            
            socket.on(CHANNEL, onMessage, clientSocket);
            socket.on('disconnect', onDisconnect, clientSocket);
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
