
var CloudCmd, Util, DOM, CloudFunc, io;

(function(CloudCmd, Util, DOM, CloudFunc) {
    'use strict';
    
    CloudCmd.Socket = SocketProto;
        
    function SocketProto(callback) {
        var Socket              = Util.exec.bind(Util),
            AllListeners        = {},
            socket,
            exec                = Util.exec,
            log                 = Util.log.bind(Util),
            
            CONNECTED           = 'socket connected\n',
            DISCONNECTED        = 'socket disconnected\n',
            
            ERROR_MSG           = 'could not connect to socket.io\n'+
                              'npm i socket.io';
        
        Socket.on               = addListener;
        Socket.addListener      = addListener;
        Socket.removeListener   = removeListener;
        Socket.send             = send;
        Socket.emit             = emit;
        
        Socket.CONNECTED        = CONNECTED;
        Socket.DISCONNECTED     = DISCONNECTED;
        
        function init(callback) {
            var loadSocket  = function(isRemote) {
                    var urlLocal    = '/socket.io/socket.io.js',
                        urlCDN      = 'https://cdn.socket.io/socket.io-1.0.0.js',
                        url         = isRemote ? urlCDN : urlLocal,
                        
                        onerror     = function() {
                            log(ERROR_MSG);
                            
                            if (isRemote)
                                loadSocket(callback);
                        },
                        
                        onload      = function() {
                            exec(callback);
                            
                            if (!socket)
                                connect();
                        };
                    
                    DOM.load.js(url, {
                        onerror : exec.with(onerror, callback),
                        onload  : exec.with(onload, callback)
                    });
            };
            
            CloudCmd.getConfig(function(config) {
                var isOnline = config.online;
                
                loadSocket(isOnline);
            });
        }
        
        function addListener(name, func) {
           CloudFunc.addListener(name, func, AllListeners, socket);
        }
        
        function removeListener(name, func) {
            CloudFunc.removeListener(name, func, AllListeners, socket);
        }
        
        function send(data) {
            if (socket)
                socket.send(data);
        }
        
        function emit(channel, data) {
            if (socket)
                socket.emit(channel, data);
        }
        
        function setListeners(all, socket) {
            var listeners;
            
            Object.keys(all).forEach(function(name) {
                listeners   = all[name];
                
                listeners.forEach(function(func) {
                    if (func)
                        socket.on(name, func);
                });
            });
        }
        
        function connect() {
            var FIVE_SECONDS = 5000;
            
            socket = io.connect(CloudCmd.HOST, {
                'max reconnection attempts' : Math.pow(2, 32),
                'reconnection limit'        : FIVE_SECONDS
            });
            
            socket.on('connect', function () {
                log(CONNECTED);
            });
            
            setListeners(AllListeners, socket);
            
            socket.on('disconnect', function () {
                log(DISCONNECTED);
            });
            
            socket.on('reconnect_failed', function () {
                log('Could not reconnect. Reload page.');
            });
        }
        
        init(callback);
        
        return Socket;
    }
    
})(CloudCmd, Util, DOM, CloudFunc);
