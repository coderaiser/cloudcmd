 (function() {
    'use strict';
    
    var DIR_LIB             = './',
        DIR_SERVER          = DIR_LIB   + 'server/',
        
        http                = require('http'),
        
        Util                = require(DIR_LIB + 'util'),
        middleware          = require(DIR_LIB + 'cloudcmd'),
        
        config              = require(DIR_SERVER + 'config'),
        express             = require(DIR_SERVER + 'express'),
        
        tryRequire          = require(DIR_SERVER + 'tryRequire'),
        
        io                  = tryRequire('socket.io', {log: true});
    
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
        
        expressApp      = express.getApp([middle], {
            auth    : config('auth'),
            username: config('username'),
            password: config('password')
        });
        
        if (expressApp)
            app             = expressApp;
        else
            app             = middleware;
        
        server = http.createServer(app);
        
        server.on('error', function(error) {
            Util.log(error.message);
        });
        
        server.listen(port, ip);
        
        if (io) {
            socket = io.listen(server);
            middleware.listen(socket);
        }
        
        if (!config('ip'))
            ip = 'localhost';
        
        Util.log('url: http://' + ip + ':' + port);
    };
})();
