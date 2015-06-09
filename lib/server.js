 (function() {
    'use strict';
    
    var DIR_LIB             = './',
        DIR_SERVER          = DIR_LIB   + 'server/',
        
        http                = require('http'),
        
        middleware          = require(DIR_LIB + 'cloudcmd'),
        exit                = require(DIR_SERVER + 'exit'),
        config              = require(DIR_SERVER + 'config'),
        express             = require(DIR_SERVER + 'express'),
        io                  = require('socket.io');
    
    /**
     * start server function
     *
     */
    module.exports  = function(options) {
        var server, app, socket,
        
        middle  = middleware(options),
        
        port    =   process.env.PORT            ||  /* c9           */
                    process.env.VCAP_APP_PORT   ||  /* cloudfoundry */
                    config('port'),
        
        ip      =   process.env.IP              ||  /* c9           */
                    config('ip')                ||
                    '0.0.0.0',
        
        expressApp      = express.getApp(middle, {
            auth    : config('auth'),
            username: config('username'),
            password: config('password')
        });
        
        if (expressApp)
            app             = expressApp;
        else
            app             = middle;
        
        server = http.createServer(app);
        socket = io.listen(server);
        
        server.on('error', function(error) {
            exit('cloudcmd --port: %s', error.message);
        });
        
        middleware.listen(socket);
        server.listen(port, ip);
        
        console.log('url: http://%s:%d', config('ip') || 'localhost', port);
    };
})();
