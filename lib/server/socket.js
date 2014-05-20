(function() {
    'use strict';
    
    var main            = global.cloudcmd.main,
        io              = main.require('socket.io'),
        CloudFunc       = main.cloudfunc,
        
        WIN32           = main.WIN32,
        INFO_LOG_LEVEL  = 2,
        AllListeners    = [];
    
    exports.on              = addListener;
    exports.addListener     = addListener;
    exports.removeListener  = removeListener;
    exports.send            = send;
    exports.emit            = emit;
    exports.listen          = listen;
    
    function addListener(name, func, socket) {
        if (!socket)
            socket = io.sockets;
        
        CloudFunc.addListener(name, func, AllListeners, socket);
    }
    
    function removeListener(name, func, socket) {
        CloudFunc.removeListener(name, func, AllListeners, socket);
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
        if (io)
            io          = io.listen(server);
        
        return io;
    }
})();
