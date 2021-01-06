'use strict';

const path = require('path');
const {once} = require('events');

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
    
    const [data] = await once(socket, 'data');
    
    socket.close();
    await done();
    
    t.equal(data, 'client #1 console connected\n', 'should emit data event');
    t.end();
});

test('cloudcmd: console: disabled', async (t) => {
    const config = {
        console: false,
    };
    
    const {port, done} = await connect({config});
    const socket = io(`http://localhost:${port}/console`);
    
    const [error] = await once(socket, 'connect_error');
    
    socket.close();
    await done();
    
    t.equal(error.message, 'Invalid namespace', 'should emit error');
    t.end();
});

