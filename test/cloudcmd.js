const assert = require('assert');
const http = require('http');
const fs = require('fs');

const test = require('tape');
const express = require('express');
const promisify = require('es6-promisify');
const pullout = require('pullout');

const wrap = (fn, ...a) => (...b) => fn(...a, ...b);
const warp = (fn, ...a) => (...b) => fn(...b, ...a);
const success = (fn) => (...args) => fn(null, ...args);

const freeport = promisify(require('freeport'));
const _pullout = promisify(pullout);

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
            .then(warp(_pullout, 'string'))
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

test('cloudcmd: rest: pack', (t) => {
    before((port, after) => {
        console.log(port);
        get(`http://${host}:${port}/api/v1/pack/fixture/pack`)
            .then(warp(_pullout, 'buffer'))
            .then((pack) => {
                const fixture = fs.readFileSync(__dirname + '/fixture/pack.tar.gz');
                t.ok(fixture.compare(pack), 'should pack data');
                t.end();
                after();
            })
            .catch((error) => {
                console.log(error);
            });
    });
});

