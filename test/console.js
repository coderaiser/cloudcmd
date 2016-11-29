'use strict';

const test = require('tape');
const io = require('socket.io-client');

const before = require('./before');

test('cloudcmd: console: enabled by default', (t) => {
    before({}, (port, after) => {
        const socket = io(`http://localhost:${port}/console`)
        
        socket.once('data', (data) => {
            socket.close();
            t.equal(data, 'client #1 console connected\n', 'should emit data event');
            after();
            t.end();
        });
    });
});

test('cloudcmd: console: enabled', (t) => {
    const config = {console: true};
    
    before({config}, (port, after) => {
        const socket = io(`http://localhost:${port}/console`)
        
        socket.once('data', (data) => {
            socket.close();
            t.equal(data, 'client #1 console connected\n', 'should emit data event');
            after();
            t.end();
        });
    });
});

test('cloudcmd: console: disabled', (t) => {
    const config = {console: false};
    
    before({config}, (port, after) => {
        const socket = io(`http://localhost:${port}/console`);
        
        socket.on('error', (error) => {
            t.equal(error, 'Invalid namespace', 'should emit error');
            socket.close();
            after();
            t.end();
        });
    });
});

