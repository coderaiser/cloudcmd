(function() {
    'use strict';
    
    var DIR             = '../',
        Util            = require(DIR + 'util'),
        io              = tryRequire('socket.io'),
        
        Socket,
        
        AllListeners    = [];
    
    exports.on              = addListener;
    exports.addListener     = addListener;
    exports.removeListener  = removeListener;
    exports.send            = send;
    exports.emit            = emit;
    exports.listen          = listen;
    
    function addListener(name, socket, func) {
        if (!func) {
            func    = socket;
            socket  = Socket;
        }
        
        Util.addListener(name, func, AllListeners, socket);
    }
    
    function removeListener(name, socket, func) {
        if (!func) {
            func    = socket;
            socket  = Socket;
        }
        
        Util.removeListener(name, func, AllListeners, socket);
    }
    
    function send(msg, socket) {
        if (socket)
            socket.send(msg);
    }
    
    function emit(channel, message, socket, all) {
        var obj;
        
        if (socket) {
            if (all)
                obj = socket.broadcast;
            else
                obj = socket;
            
            obj.emit(channel, message);
        }
    }
    
    /**
     * function listen on servers port
     * @server {Object} started server object
     */
    function listen(server) {
        var result;
        
        if (io) {
            result  = io.listen(server);
            Socket  = result.sockets;
        }
        
        return Socket;
    }
    
    function tryRequire(name) {
        var module;
        
        Util.exec.try(function() {
            module = require(name);
        });
        
        return module;
    }
})();
