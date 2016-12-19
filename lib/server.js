'use strict';

const DIR_LIB = './';
const DIR_SERVER = DIR_LIB + 'server/';

const cloudcmd = require(DIR_LIB + 'cloudcmd');

const exit = require(DIR_SERVER + 'exit');
const config = require(DIR_SERVER + 'config');
const prefixer = require(DIR_SERVER + 'prefixer');

const http = require('http');
const opn = require('opn');
const express = require('express');
const io = require('socket.io');
const squad = require('squad');
const apart = require('apart');

const tryRequire = require('tryrequire');
const logger = tryRequire('morgan');

const prefix = squad(prefixer, apart(config, 'prefix'));

module.exports = (options) => {
    const port = process.env.PORT            ||  /* c9           */
                 process.env.VCAP_APP_PORT   ||  /* cloudfoundry */
                 config('port');
    
    const ip =  process.env.IP               ||  /* c9           */
                config('ip')                 ||
                '0.0.0.0';
    
    const app = express();
    const server = http.createServer(app);
    
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
    
    server.listen(port, ip, () => {
        const host = config('ip') || 'localhost';
        const port0 = port || server.address().port;
        const url = `http://${host}:${port0}${prefix()}/`;
        
        console.log('url:', url);
        
        if (!config('open'))
            return;
        
        opn(url);
    });
    
    server.on('error', error => {
        exit('cloudcmd --port: %s', error.message);
    });
};

