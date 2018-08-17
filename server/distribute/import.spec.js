'use strict';

const test = require('tape');
const {promisify} = require('util');
const tryToCatch = require('try-to-catch');
const io = require('socket.io-client');
const mockRequire = require('mock-require');

const {connect} = require('../../test/before');

const config = require('../config');
const distribute = {
    import: promisify(require('./import')),
};

test('distribute: import: canceled', async (t) => {
    const {done, port} = await connect({
        config: {
            export: false,
            import: false,
            importListen: false,
            log: false,
        }
    });
    
    const {status} = await distribute.import();
    
    await done();
    
    t.equal(status, 'canceled', 'should equal');
    t.end();
});

test('distribute: import: received: no error', async (t) => {
    const {done, port} = await connect({
        config: {
            import: true,
            importListen: false,
            export: true,
            log: false,
        }
    });
    
    config('importUrl', `http://localhost:${port}`);
    
    const [e] = await tryToCatch(distribute.import);
    
    await done();
    
    t.notOk(e, 'should not be error');
    t.end();
});

test('distribute: import: received', async (t) => {
    const {done, port} = await connect({
        config: {
            name: 'bill',
            import: true,
            importToken: 'a',
            exportToken: 'a',
            export: true,
            importListen: false,
            log: false,
        }
    });
    
    config('importUrl', `http://localhost:${port}`);
    
    const {status} = await distribute.import();
    await done();
    
    t.equal(status, 'received','should equal');
    t.end();
});

test('distribute: import: received: auth: reject', async (t) => {
    const {done, port} = await connect({
        config: {
            name: 'bill',
            import: true,
            importToken: 'xxxxx',
            exportToken: 'bbbbb',
            export: true,
            importListen: false,
            log: false,
        }
    });
    
    config('importUrl', `http://localhost:${port}`);
    
    const {status} = await distribute.import();
    await done();
    
    t.equal(status, 'reject','should equal');
    t.end();
});

test('distribute: import: received: auth: accept', async (t) => {
    const {done, port} = await connect({
        config: {
            name: 'bill',
            import: true,
            importToken: 'xxxxx',
            exportToken: 'xxxxx',
            export: true,
            importListen: false,
            log: false,
        }
    });
    
    config('importUrl', `http://localhost:${port}`);
    
    const {status} = await distribute.import();
    await done();
    
    t.equal(status, 'received','should equal');
    t.end();
});

test('distribute: import: received: no name', async (t) => {
    const {done, port} = await connect({
        config: {
            name: '',
            import: true,
            export: true,
            importListen: false,
            log: false,
        }
    });
    
    config('importUrl', `http://localhost:${port}`);
    
    const {status} = await distribute.import();
    await done();
    
    t.equal(status, 'received','should equal');
    t.end();
});

test('distribute: import: error', async (t) => {
    const {done, port} = await connect({
        config: {
            import: true,
            export: false,
            importListen: false,
            log: false,
        }
    });
    
    config('importUrl', `http://localhost:0`);
    
    const {status} = await distribute.import({
        reconnection: false,
    });
    
    await done();
    
    t.equal(status, 'connect_error','should equal');
    t.end();
});

test('distribute: import: config:change: no export', async (t) => {
    const {done, port} = await connect({
        config: {
            import: true,
            export: false,
            importListen: true,
            log: false,
        }
    });
    
    const {status} = await distribute.import({
        reconnection: false,
    });
    
    await done();
    
    t.equal(status, 'connect_error','should equal');
    t.end();
});

process.on('unhandledRejection', console.log);

