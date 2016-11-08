'use strict';

const http = require('http');

const express = require('express');
const cloudcmd = require('..');

module.exports = (fn) => {
    const app = express();
    const server = http.createServer(app);
    const after = () => {
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

