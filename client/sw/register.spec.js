'use strict';

const test = require('tape');
const sinon = require('sinon');
const mock = require('mock-require');
const tryCatch = require('try-catch');

test('sw: listen', (t) => {
    const {listenSW} = mock.reRequire('./register');
    const addEventListener = sinon.stub();
    const sw = {
        addEventListener,
    };
    
    listenSW(sw, 'hello', 'world');
    
    t.ok(addEventListener.calledWith('hello', 'world'), 'should call addEventListener');
    t.end();
});

test('sw: lesten: no sw', (t) => {
    const {listenSW} = mock.reRequire('./register');
    const [e] = tryCatch(listenSW, null, 'hello', 'world');
    
    t.notOk(e, 'should not throw');
    t.end();
});

test('sw: register: registerSW: no serviceWorker', async (t) => {
    const {navigator} = global;
    global.navigator = {};
    
    const {
        registerSW,
    } = mock.reRequire('./register');
    
    await registerSW();
    
    global.navigator = navigator;
    
    t.pass('should not call register');
    t.end();
});

test('sw: register: registerSW: no https', async (t) => {
    const {
        navigator,
        location,
    } = global;
    
    const register = sinon.stub();
    
    global.navigator = getNavigator({
        register,
    });
    
    global.location = {
        protocol: 'http:'
    };
    
    const {
        registerSW,
    } = mock.reRequire('./register');
    
    await registerSW();
    
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
    
    global.location = {
        protocol: 'http:',
        hostname: 'cloudcmd.io',
    };
    
    const register = sinon.stub();
    
    global.navigator = getNavigator({
        register,
    });
    
    const {
        registerSW,
    } = mock.reRequire('./register');
    
    await registerSW();
    
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
    
    global.location = {
        hostname: 'localhost',
    };
    
    const register = sinon.stub();
    
    global.navigator = getNavigator({
        register,
    });
    
    const {
        registerSW,
    } = mock.reRequire('./register');
    
    await registerSW('/hello');
    
    global.location = location;
    global.navigator = navigator;
    
    t.ok(register.calledWith('/hello/sw.js'), 'should call register');
    t.end();
});

test('sw: register: unregisterSW', async (t) => {
    const {
        navigator,
        location,
    } = global;
    
    global.location = {
        hostname: 'localhost',
    };
    
    const reg = {
        unregister: sinon.stub()
    };
    
    const register = sinon.stub()
        .returns(Promise.resolve(reg));
    
    global.navigator = getNavigator({
        register,
    });
    
    const {
        unregisterSW,
    } = mock.reRequire('./register');
    
    await unregisterSW();
    
    global.location = location;
    global.navigator = navigator;
    
    t.ok(register.calledWith(), 'should call register');
    t.end();
});


function getNavigator({register, unregister}) {
    unregister = unregister || sinon.stub();
    
    return {
        serviceWorker: {
            register,
            unregister,
        }
    };
}
