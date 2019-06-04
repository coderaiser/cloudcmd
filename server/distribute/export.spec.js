'use strict';

const test = require('supertape');
const io = require('socket.io-client');

const {connect} = require('../../test/before');
const config = require('../config').createConfig();

test('distribute: export', async (t) => {
    const defaultConfig = {
        export: true,
        exportToken: 'a',
        vim: true,
        log: false,
        prefix: '',
    };
    
    const {port, done} = await connect({
        config: defaultConfig,
        configManager: config,
    });
    
    const url = `http://localhost:${port}/distribute?port=${1111}`;
    const socket = io.connect(url);
    
    socket.on('connect', () => {
        socket.emit('auth', 'a');
    });
    
    socket.on('accept', () => {
        config('vim', false);
        config('auth', true);
    });
    
    socket.on('change', async () => {
        socket.close();
        await done();
        
        t.pass('should emit change');
        t.end();
    });
});

test('distribute: export: config', async (t) => {
    const defaultConfig = {
        export: true,
        exportToken: 'a',
        vim: true,
        log: false,
    };
    
    const {port, done} = await connect({
        config: defaultConfig,
    });
    
    const url = `http://localhost:${port}/distribute?port=${1111}`;
    const socket = io.connect(url);
    
    socket.on('connect', () => {
        socket.emit('auth', 'a');
    });
    
    socket.on('config', async (data) => {
        socket.close();
        await done();
        
        t.equal(typeof data, 'object', 'should emit object');
        t.end();
    });
});

