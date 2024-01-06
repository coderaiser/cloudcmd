import cloudcmd from './cloudcmd.js';
import http from 'node:http';
import {promisify} from 'node:util';
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
import process from 'node:process';

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

export default async (listen_uri, options, config) => {
    const prefix = config('prefix');

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

    const listen = promisifySelf(server.listen, server);
    const closeServer = promisifySelf(server.close, server);
    const closeSocket = promisifySelf(socketServer.close, socketServer);

    server.on('error', exitPort);

    switch(listen_uri.protocol) {
    case 'tcp:':
        // NOTE default to undefined if strings are empty
        await listen(
            listen_uri.port || undefined,
            listen_uri.hostname || undefined,
        );
        break;
    case 'unix:':
        await listen(listen_uri.pathname);
        break;
    default:
        console.error(`unknown protocol ${listen_uri.protocol}`);
        return;
    }

    const close = shutdown([closeServer, closeSocket]);
    process.on('SIGINT', close);

    // NOTE FIXME use an URL object to fix this mess??
    const url = `http://localhost:${server.address().port}${prefix}/`;

    console.log(`url: ${url}`);

    if (!config('open'))
        return;

    const [openError] = await tryToCatch(opn, url);

    if (openError)
        console.error('cloudcmd --open:', openError.message);
};
