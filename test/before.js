'use strict';

const http = require('http');
const os = require('os');

const express = require('express');
const writejson = require('writejson');
const readjson = require('readjson');

const cloudcmd = require('..');
const {assign} = Object;

const pathConfig = os.homedir() + '/.cloudcmd.json';
const currentConfig = readjson.sync.try(pathConfig);

module.exports = (config, fn = config) => {
    const app = express();
    const server = http.createServer(app);
    const after = () => {
        if (currentConfig)
            writejson.sync(pathConfig, currentConfig);
        
        server.close();
    };
    
    app.use(cloudcmd({
        config: assign(defaultConfig(), config)
    }));
    
    server.listen(() => {
        fn(server.address().port, after);
    });
};

function defaultConfig() {
    return {
        auth: false,
        root: __dirname
    };
}

