'use strict';

const http = require('http');
const fs = require('fs');
const os = require('os');

const express = require('express');
const writejson = require('writejson');
const readjson = require('readjson');

const cloudcmd = require('..');

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
        config: {
            auth: false,
            root: __dirname
        }
    }));
    
    server.listen(() => {
        fn(server.address().port, after);
    });
};

