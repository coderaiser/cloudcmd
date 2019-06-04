'use strict';

const path = require('path');

const test = require('supertape');
const io = require('socket.io-client');

const configPath = path.join(__dirname, '../..', 'server', 'config');
const {connect} = require('../before');
const configFn = require(configPath).createConfig();

test('cloudcmd: console: enabled', async (t) => {
    const config = {
        console: true,
    };
    
    const {port, done} = await connect({config});
    const socket = io(`http://localhost:${port}/console`);
    
    socket.emit('auth', configFn('username'), configFn('password'));
    socket.once('data', (data) => {
        done();
        socket.close();
        
        t.equal(data, 'client #1 console connected\n', 'should emit data event');
        t.end();
    });
});

test('cloudcmd: console: disabled', async (t) => {
    const config = {
        console: false,
    };
    
    const {port, done} = await connect({config});
    const socket = io(`http://localhost:${port}/console`);
    
    socket.on('error', (error) => {
        socket.close();
        done();
        
        t.equal(error, 'Invalid namespace', 'should emit error');
        t.end();
    });
});

