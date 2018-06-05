'use strict';

const test = require('tape');
const sinon = require('sinon');
const mock = require('mock-require');

const SERVICE_WORKER = 'serviceworker-webpack-plugin/lib/runtime';

test('sw: register: registerSW: no serviceWorker', async (t) => {
    const {navigator} = global;
    global.navigator = {};
    
    const register = sinon.stub();
    
    mock(SERVICE_WORKER, {
        register
    });
    
    const {
        registerSW,
    } = mock.reRequire('./register');
    
    await registerSW();
    mock.stop(SERVICE_WORKER);
    global.navigator = navigator;
    
    t.notOk(register.called, 'should not call register');
    t.end();
});

test('sw: register: registerSW: no https', async (t) => {
    const {
        navigator,
        location,
    } = global;
    
    global.navigator = {
        serviceWorker: true
    };
    
    global.location = {
        protocol: 'http:'
    };
    
    const register = sinon.stub();
    
    mock(SERVICE_WORKER, {
        register
    });
    
    const {
        registerSW,
    } = mock.reRequire('./register');
    
    await registerSW();
    
    mock.stop(SERVICE_WORKER);
    
    global.location = location;
    global.navigator = navigator;
    
    t.notOk(register.called, 'should not call register');
    t.end();
});

test('sw: register: registerSW: no localhost', async (t) => {
    const {
        navigator,
        location,
    } = global;
    
    global.navigator = {
        serviceWorker: true
    };
    
    global.location = {
        protocol: 'http:',
        hostname: 'cloudcmd.io',
    };
    
    const register = sinon.stub();
    
    mock(SERVICE_WORKER, {
        register
    });
    
    const {
        registerSW,
    } = mock.reRequire('./register');
    
    await registerSW();
    
    mock.stop(SERVICE_WORKER);
    
    global.location = location;
    global.navigator = navigator;
    
    t.notOk(register.called, 'should not call register');
    t.end();
});

test('sw: register: registerSW', async (t) => {
    const {
        navigator,
        location,
    } = global;
    
    global.navigator = {
        serviceWorker: true
    };
    
    global.location = {
        hostname: 'localhost',
    };
    
    const register = sinon.stub();
    
    mock(SERVICE_WORKER, {
        register
    });
    
    const {
        registerSW,
    } = mock.reRequire('./register');
    
    await registerSW();
    
    mock.stop(SERVICE_WORKER);
    
    global.location = location;
    global.navigator = navigator;
    
    t.ok(register.calledWith(), 'should call register');
    t.end();
});

test('sw: register: unregisterSW', async (t) => {
    const {
        navigator,
        location,
    } = global;
    
    global.navigator = {
        serviceWorker: true
    };
    
    global.location = {
        hostname: 'localhost',
    };
    
    const reg = {
        unregister: sinon.stub()
    };
    
    const register = sinon.stub()
        .returns(Promise.resolve(reg));
    
    mock(SERVICE_WORKER, {
        register
    });
    
    const {
        unregisterSW,
    } = mock.reRequire('./register');
    
    await unregisterSW();
    
    mock.stop(SERVICE_WORKER);
    
    global.location = location;
    global.navigator = navigator;
    
    t.ok(register.calledWith(), 'should call register');
    t.end();
});

