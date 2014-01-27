
var CloudCmd, Util, DOM, io;

(function(CloudCmd, Util, DOM) {
    'use strict';
    
    CloudCmd.Socket = SocketProto;
        
    function SocketProto(callback) {
        var Socket              = Util.exec.bind(Util),
            AllListeners        = {},
            socket,
            
            CONNECTED           = 'socket connected\n',
            DISCONNECTED        = 'socket disconnected\n',
            
            ERROR_MSG           = 'could not connect to socket.io\n'+
                              'npm i socket.io';
        
        Socket.on               = addListener;
        Socket.addListener      = addListener;
        Socket.removeListener   = removeListener;
        Socket.send             = send;
        
        Socket.CONNECTED        = CONNECTED;
        Socket.DISCONNECTED     = DISCONNECTED;
        
        function init(callback) {
            DOM.jsload('/socket.io/lib/socket.io.js', {
                onerror : Util.retFunc(Util.log, ERROR_MSG),
                onload  : function() {
                    Util.exec(callback);
                    
                    if (!socket)
                        connect();
                }
            });
        }
        
        function addListener(name, func) {
            var listeners = AllListeners[name];
            
            if (!listeners)
                listeners = AllListeners[name] = [];
            
            listeners.push(func);
            
            if (func && socket)
                socket.on(name, func);
        }
        
        function removeListener(name, func) {
            var i, n, listeners;
            
            if (socket)
                socket.removeListener(name, func);
            
            listeners   = AllListeners[name];
            
            if (listeners) {
                n = listeners.length;
                
                for (i = 0; i < n; i++)
                    if (listeners[i] === func)
                        listeners[i] = null;
            }
        }
        
        function send(data) {
            if (socket)
                socket.send(data);
        }
        
        function setListeners(all, socket) {
            var i, n, name, func, listeners;
            
            for (name in all) {
                listeners   = all[name];
                n           = listeners.length;
                
                for (i = 0; i < n; i++) {
                    func    = listeners[i];
                    
                    if (func && socket)
                        socket.on(name, func);
                }
            }
            
        }
        
        function connect() {
            var FIVE_SECONDS = 5000;
            
            socket = io.connect(CloudCmd.HOST, {
                'max reconnection attempts' : Math.pow(2, 32),
                'reconnection limit'        : FIVE_SECONDS
            });
            
            socket.on('connect', function () {
                Util.log(CONNECTED);
            });
            
            setListeners(AllListeners, socket);
            
            socket.on('disconnect', function () {
                Util.log(DISCONNECTED);
            });
            
            socket.on('reconnect_failed', function () {
                Util.log('Could not reconnect. Reload page.');
            });
        }
        
        init(callback);
        
        return Socket;
    }
    
})(CloudCmd, Util, DOM);
