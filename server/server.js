import http from 'node:http';
import {promisify} from 'node:util';
import process from 'node:process';
import {rateLimit} from 'express-rate-limit';
import currify from 'currify';
import squad from 'squad';
import {tryToCatch} from 'try-to-catch';
import opn from 'open';
import express from 'express';
import {Server} from 'socket.io';
import wraptile from 'wraptile';
import compression from 'compression';
import tryRequire from 'tryrequire';
import {cloudcmd} from '#server/cloudcmd';
import exit from './exit.js';

const RATE_LIMIT = 1000;
const RATE_WINDOW = 15 * 60 * 1000;

const bind = (f, self) => f.bind(self);

const two = currify((f, a, b) => f(a, b));
const shutdown = wraptile(async (promises) => {
    console.log('closing cloudcmd...');
    await Promise.all(promises);
    process.exit(0);
});

const promisifySelf = squad(promisify, bind);

const exitPort = two(exit, 'cloudcmd --port: %s');

const logger = tryRequire('morgan');

export default async (options, config) => {
    const prefix = config('prefix');
    const port = process.env.PORT /* c9           */ || config('port');
    
    const ip = process.env.IP /* c9           */ || config('ip') || '0.0.0.0';
    
    const app = express();
    const server = http.createServer(app);
    
    if (logger)
        app.use(logger('dev'));
    
    if (prefix)
        app.get('/', (req, res) => res.redirect(`${prefix}/`));
    
    const socketServer = new Server(server, {
        path: `${prefix}/socket.io`,
    });
    
    const limiter = rateLimit({
        windowMs: RATE_WINDOW,
        limit: RATE_LIMIT,
    });
    
    app.use(compression());
    app.use(limiter);
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
    process.on('SIUSR1', close);
    
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
