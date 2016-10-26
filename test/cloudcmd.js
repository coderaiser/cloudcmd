const http = require('http');

const test = require('tape');
const express = require('express');
const promisify = require('es6-promisify');
const pipe = require('pipe-io');

const wrap = (fn, ...a) => (...b) => fn(...a, ...b);
const success = (fn) => (...args) => fn(null, ...args);

const freeport = promisify(require('freeport'));
const getBody = promisify(pipe.getBody);
const get = promisify((url, fn) => {
    http.get(url, success(fn));
});

const cloudcmd = require('..');

const host = '127.0.0.1';

const before = (fn) => {
    const app = express();
    const server = http.createServer(app);
    const after = () => {
        server.close();
    };
    
    const listen = (port) => {
       server.listen(port, host, wrap(fn, port, after));
    };
    
    app.use(cloudcmd({
        config: {
            auth: false,
            root: __dirname
        }
    }));
    
    freeport()
        .then(listen)
};

test('cloudcmd: rest: fs: path', (t) => {
    before((port, after) => {
        console.log(port);
        get(`http://${host}:${port}/api/v1/fs`)
            .then(wrap(getBody))
            .then(JSON.parse)
            .then((dir) => {
                t.equal('/', dir.path, 'should dir path be "/"');
                t.end();
                after();
            })
            .catch((error) => {
                console.log(error);
            });
    });
});

