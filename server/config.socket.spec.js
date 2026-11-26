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

test('cloudcmd: config socket: object password: should emit error and stay alive', async (t) => {
    const {port, done} = await connect({
        configManager: createConfig(),
    });
    
    const message = await emitAndWaitForError(port, {
        password: {},
    });
    
    const alive = await emitAndWaitForError(port, 'hello');
    
    await done();
    const result = [message, alive];
    const expected = [wrongType, wrongType];
    
    t.deepEqual(result, expected);
    t.end();
});

test('cloudcmd: config socket: array password: should emit error and stay alive', async (t) => {
    const {port, done} = await connect({
        configManager: createConfig(),
    });
    
    const message = await emitAndWaitForError(port, {
        password: [],
    });
    
    const alive = await emitAndWaitForError(port, 'hello');
    
    await done();
    const result = [message, alive];
    const expected = [wrongType, wrongType];
    
    t.deepEqual(result, expected);
    t.end();
});

test('cloudcmd: config socket: number password: should emit error and stay alive', async (t) => {
    const {port, done} = await connect({
        configManager: createConfig(),
    });
    
    const message = await emitAndWaitForError(port, {
        password: 1,
    });
    
    const alive = await emitAndWaitForError(port, 'hello');
    
    await done();
    const result = [message, alive];
    const expected = [wrongType, wrongType];
    
    t.deepEqual(result, expected);
    t.end();
});

test('cloudcmd: config socket: boolean password: should emit error and stay alive', async (t) => {
    const {port, done} = await connect({
        configManager: createConfig(),
    });
    
    const message = await emitAndWaitForError(port, {
        password: true,
    });
    
    const alive = await emitAndWaitForError(port, 'hello');
    
    await done();
    const result = [message, alive];
    const expected = [wrongType, wrongType];
    
    t.deepEqual(result, expected);
    t.end();
});
