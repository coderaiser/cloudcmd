/* module make possible connectoin thru socket.io on a server */

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
    exports.listen          = listen;
    
    function addListener(name, func, socket) {
        if (!socket)
            socket = io.sockets;
        
        CloudFunc.addListener(name, func, AllListeners, socket);
    }
    
    function removeListener(name, func, socket) {
        CloudFunc.removeListener(name, func, AllListeners, socket);
    }
    
    function send(msg, clientSocket) {
        clientSocket.send(msg);
    }
    
    /**
     * function listen on servers port
     * @pServer {Object} started server object
     */
    function listen(pServer) {
        var ret;
        
        if (io) {
            io          = io.listen(pServer);
            
            io.set('log level', INFO_LOG_LEVEL);
            
            /* 
             * on Win7 application is crashing, 
             * when options below is used.
             * 
             * https://github.com/LearnBoost/socket.io/issues/1314
             *
             */
            if (!WIN32) {
                io.enable('browser client minification');
                io.enable('browser client gzip');
                io.enable('browser client etag');
            }
            
            io.set('transports', [
              'websocket',
              'htmlfile',
              'xhr-polling',
              'jsonp-polling'
            ]);
        }
        
        return ret;
    }
})();
