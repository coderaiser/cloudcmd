const assert = require('assert');
const http = require('http');
const fs = require('fs');

const test = require('tape');
const express = require('express');
const promisify = require('es6-promisify');
const pipe = require('pipe-io');

const wrap = (fn, ...a) => (...b) => fn(...a, ...b);
const success = (fn) => (...args) => fn(null, ...args);

const freeport = promisify(require('freeport'));
const getBody = promisify(pipe.getBody);
const getBuffer = promisify(_getBuffer);

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

test('cloudcmd: rest: pack', (t) => {
    before((port, after) => {
        console.log(port);
        get(`http://${host}:${port}/api/v1/pack/fixture/pack`)
            .then(wrap(getBuffer))
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

/**
 * get body of readStream
 *
 * @param readStream
 * @param callback
 */
function _getBuffer(readStream, callback) {
    var error,
        body = [];
    
    assert(readStream, 'could not be empty!');
    assert(callback, 'could not be empty!');
     
    readStream.on('data', onData);
    readStream.on('error', onEnd);
    readStream.on('end', onEnd);
    
    function onData(chunk) {
        body.push(chunk);
    }
    
    function onEnd(error) {
        readStream.removeListener('data', onData);
        readStream.removeListener('error', onEnd);
        readStream.removeListener('end', onEnd);
        
        callback(error, Buffer.from(body));
    }
}

