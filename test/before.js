'use strict';

const http = require('http');
const os = require('os');

const express = require('express');
const io = require('socket.io');
const writejson = require('writejson');
const readjson = require('readjson');
const {promisify} = require('util');

process.env.NODE_ENV = 'development';

const cloudcmd = require('../server/cloudcmd');
const {assign} = Object;

const pathConfig = os.homedir() + '/.cloudcmd.json';
const currentConfig = readjson.sync.try(pathConfig);

module.exports = before;

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
        fn(server.address().port, promisify(after));
    });
}

module.exports.connect = promisify((options, fn = options) => {
    before(options, (port, done) => {
        fn(null, {port, done});
    });
});

function defaultConfig() {
    return {
        auth: false,
        root: __dirname,
    };
}

