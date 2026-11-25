import {io as connectClient} from 'socket.io-client';
import {test} from 'supertape';
import {connect} from '../test/before.js';
import {createConfig} from './config.js';

const wrongType = 'Error: Wrong data type!';

const emitAndWaitForError = (port, payload) => {
    return new Promise((resolve, reject) => {
        const client = connectClient(`http://127.0.0.1:${port}/config`, {
            transports: ['polling'],
            reconnection: false,
        });
        
        client.on('connect_error', reject);
        client.on('err', (message) => {
            client.close();
            resolve(message);
        });
        
        client.on('connect', () => {
            client.emit('message', payload);
        });
    });
};

test('cloudcmd: config socket: null payload: should emit error', async (t) => {
    const {port, done} = await connect({
        configManager: createConfig(),
    });
    
    const message = await emitAndWaitForError(port, null);
    
    await done();
    
    t.equal(message, wrongType);
    t.end();
});

test('cloudcmd: config socket: null payload: server stays alive', async (t) => {
    const {port, done} = await connect({
        configManager: createConfig(),
    });
    
    await emitAndWaitForError(port, null);
    const message = await emitAndWaitForError(port, 'hello');
    
    await done();
    
    t.equal(message, wrongType);
    t.end();
});

test('cloudcmd: config socket: array payload: should emit error', async (t) => {
    const {port, done} = await connect({
        configManager: createConfig(),
    });
    
    const message = await emitAndWaitForError(port, []);
    
    await done();
    
    t.equal(message, wrongType);
    t.end();
});
