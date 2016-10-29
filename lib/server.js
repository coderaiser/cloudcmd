'use strict';

var DIR_LIB             = './',
    DIR_SERVER          = DIR_LIB   + 'server/',
    
    http                = require('http'),
    opn                 = require('opn'),
    
    cloudcmd            = require(DIR_LIB + 'cloudcmd'),
    exit                = require(DIR_SERVER + 'exit'),
    config              = require(DIR_SERVER + 'config'),
    prefixer            = require(DIR_SERVER + 'prefixer'),
    express             = require('express'),
    tryRequire          = require('tryrequire'),
    logger              = tryRequire('morgan'),
    io                  = require('socket.io'),
    squad               = require('squad'),
    apart               = require('apart'),
    prefix              = squad(prefixer, apart(config, 'prefix'));

/**
 * start server function
 *
 */
module.exports  = function(options) {
    var server,
        getPort,
        
        port    =   process.env.PORT            ||  /* c9           */
                    process.env.VCAP_APP_PORT   ||  /* cloudfoundry */
                    config('port'),
        
        ip      =   process.env.IP              ||  /* c9           */
                    config('ip')                ||
                    '0.0.0.0',
        
        app     = express();
    
    server          = http.createServer(app);
    
    if (logger)
        app.use(logger('dev'));
    
    app.use(cloudcmd({
        config: options,
        socket: io(server, {
            path: prefix() + '/socket.io'
        })
    }));
    
    if (port < 0 || port > 65535)
        exit('cloudcmd --port: %s', 'port number could be 1..65535, 0 means any available port');
    
    server.listen(port, ip, function() {
        var host = config('ip') || 'localhost';
        var port0 = port || server.address().port;
        var url = 'http://' + host + ':' + port0 + prefix() + '/';
        
        console.log('url:', url);
        
        if (config('open'))
            opn(url);
    });
    
    server.on('error', function(error) {
        exit('cloudcmd --port: %s', error.message);
    });
};

