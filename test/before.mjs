import process from 'node:process';
import http from 'node:http';
import os from 'node:os';
import express from 'express';
import io from 'socket.io';
import writejson from 'writejson';
import readjson from 'readjson';
import {promisify} from 'node:util';
import {fileURLToPath} from 'node:url';
import {dirname} from 'node:path';
import cloudcmd from '../server/cloudcmd.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

process.env.NODE_ENV = 'development';
const {assign} = Object;

const pathConfig = os.homedir() + '/.cloudcmd.json';
const currentConfig = readjson.sync.try(pathConfig);

export default before;

function before(options, fn = options) {
    const {
        config,
        plugins,
        modules,
        configManager,
    } = options;
    
    const app = express();
    const server = http.createServer(app);
    
    const after = (cb) => {
        if (currentConfig)
            writejson.sync(pathConfig, currentConfig);
        
        server.close(cb);
    };
    
    const socket = io(server);
    
    app.use(cloudcmd({
        socket,
        plugins,
        config: assign(defaultConfig(), config),
        configManager,
        modules,
    }));
    
    server.listen(() => {
        fn(server
            .address().port, promisify(after));
    });
}

export const connect = promisify((options, fn = options) => {
    before(options, (port, done) => {
        fn(null, {
            port,
            done,
        });
    });
});

function defaultConfig() {
    return {
        auth: false,
        root: __dirname,
    };
}
