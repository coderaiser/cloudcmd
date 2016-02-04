 (function() {
    'use strict';
    
    var DIR_LIB             = './',
        DIR_SERVER          = DIR_LIB   + 'server/',
        
        path                = require('path'),
        http                = require('http'),
        
        cloudcmd            = require(DIR_LIB + 'cloudcmd'),
        exit                = require(DIR_SERVER + 'exit'),
        config              = require(DIR_SERVER + 'config'),
        prefixer            = require(DIR_SERVER + 'prefixer'),
        express             = require('express'),
        tryRequire          = require('tryrequire'),
        logger              = tryRequire('morgan'),
        io                  = require('socket.io');
    
    /**
     * start server function
     *
     */
    module.exports  = function(options) {
        var server,
            
            port    =   process.env.PORT            ||  /* c9           */
                        process.env.VCAP_APP_PORT   ||  /* cloudfoundry */
                        config('port'),
            
            ip      =   process.env.IP              ||  /* c9           */
                        config('ip')                ||
                        '0.0.0.0',
            
            app      = express();
        
        server          = http.createServer(app);
        
        if (logger)
            app.use(logger('dev'));
        
        app.use(cloudcmd({
            config: options,
            socket: io(server, {
                path: prefixer(config('prefix')) + '/socket.io'
            })
        }));
        
        if (port < 1 || port > 65535)
            exit('cloudcmd --port: %s', 'port number could be 1..65535');
        
        server.on('error', function(error) {
            exit('cloudcmd --port: %s', error.message);
        });
        
        server.listen(port, ip);
        
        console.log('url: http://%s:%d', config('ip') || 'localhost', port);
    };
})();
