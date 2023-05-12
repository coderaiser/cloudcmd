import cloudcmd from './cloudcmd.js';

import http from 'http';
import {promisify} from 'util';
import currify from 'currify';
import squad from 'squad';
import tryToCatch from 'try-to-catch';
import wraptile from 'wraptile';
import compression from 'compression';
import threadIt from 'thread-it';

import exit from './exit.js';
import opn from 'open';

import express from 'express';
import {Server} from 'socket.io';
import tryRequire from 'tryrequire';

const bind = (f, self) => f.bind(self);

const two = currify((f, a, b) => f(a, b));
const shutdown = wraptile(async (promises) => {
    console.log('closing cloudcmd...');
    await Promise.all(promises);
    threadIt.terminate();
    process.exit(0);
});
const promisifySelf = squad(promisify, bind);

const exitPort = two(exit, 'cloudcmd --port: %s');
const logger = tryRequire('morgan');

export default async (options, config) => {
    const prefix = config('prefix');
    const port = process.env.PORT /* c9           */
                 || config('port');
    
    const ip = process.env.IP /* c9           */
                || config('ip')
                || '0.0.0.0';
    
    const app = express();
    const server = http.createServer(app);
    
    if (logger)
        app.use(logger('dev'));
    
    if (prefix)
        app.get('/', (req, res) => res.redirect(`${prefix}/`));
    
    const socketServer = new Server(server, {
        path: `${prefix}/socket.io`,
    });
    
    app.use(compression());
    
    app.use(prefix, cloudcmd({
        config: options,
        socket: socketServer,
        configManager: config,
    }));
    
    if (port < 0 || port > 65_535)
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

