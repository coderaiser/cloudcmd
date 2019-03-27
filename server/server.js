'use strict';

const DIR_SERVER = './';
const cloudcmd = require(DIR_SERVER + 'cloudcmd');

const http = require('http');
const {promisify} = require('util');
const currify = require('currify');
const squad = require('squad');
const tryToCatch = require('try-to-catch');
const wraptile = require('wraptile');

const config = require(DIR_SERVER + 'config');

const two = currify((f, a, b) => f(a, b));
const exit = require(DIR_SERVER + 'exit');

const exitPort = two(exit, 'cloudcmd --port: %s');
const bind = (f, self) => f.bind(self);
const promisifySelf = squad(promisify, bind);

const shutdown = wraptile(async (promises) => {
    console.log('closing cloudcmd...');
    await Promise.all(promises);
    process.exit(0);
});

const opn = require('open');
const express = require('express');
const io = require('socket.io');

const tryRequire = require('tryrequire');
const logger = tryRequire('morgan');

module.exports = async (options) => {
    const prefix = config('prefix');
    const port = process.env.PORT || /* c9           */
                 config('port');
    
    const ip = process.env.IP || /* c9           */
                config('ip') ||
                '0.0.0.0';
    
    const app = express();
    const server = http.createServer(app);
    
    if (logger)
        app.use(logger('dev'));
    
    if (prefix)
        app.get('/', (req, res) => res.redirect(prefix + '/'));
    
    const socketServer = io(server, {
        path: `${prefix}/socket.io`,
    });
    
    app.use(prefix, cloudcmd({
        config: options,
        socket: socketServer,
    }));
    
    if (port < 0 || port > 65535)
        return exitPort('port number could be 1..65535, 0 means any available port');
    
    const listen = promisifySelf(server.listen, server);
    const closeServer = promisifySelf(server.close, server);
    const closeSocket = promisifySelf(socketServer.close, socketServer);
    
    server.on('error', exitPort);
    await listen(port, ip);
    
    const close = shutdown([closeServer, closeSocket]);
    process.on('SIGINT', close);
    
    const host = config('ip') || 'localhost';
    const port0 = port || server.address().port;
    const url = `http://${host}:${port0}${prefix}/`;
    console.log(`url: ${url}`);
    
    if (!config('open'))
        return;
    
    const [openError] = await tryToCatch(opn, url);
    
    if (openError)
        console.error('cloudcmd --open:', openError.message);
};

