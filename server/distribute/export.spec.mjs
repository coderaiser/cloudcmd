import {once} from 'node:events';
import test from 'supertape';
import io from 'socket.io-client';
import Config from '../config.js';
import {connect} from '../../test/before.mjs';

const config = Config.createConfig();

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
    
    const url = `http://localhost:${port}/distribute?port=1111`;
    const socket = io.connect(url);
    
    await once(socket, 'connect');
    socket.emit('auth', 'a');
    
    await once(socket, 'accept');
    config('vim', false);
    config('auth', true);
    
    await once(socket, 'change');
    
    socket.close();
    await done();
    
    t.pass('should emit change');
    t.end();
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
    
    const url = `http://localhost:${port}/distribute?port=1111`;
    const socket = io.connect(url);
    
    socket.once('connect', () => {
        socket.emit('auth', 'a');
    });
    
    const data = await once(socket, 'config');
    
    socket.close();
    await done();
    
    t.equal(typeof data, 'object', 'should emit object');
    t.end();
});
