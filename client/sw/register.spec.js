'use strict';

const test = require('tape');
const stub = require('@cloudcmd/stub');
const tryCatch = require('try-catch');
const {reRequire} = require('mock-require');

test('sw: listen', (t) => {
    const {listenSW} = reRequire('./register');
    const addEventListener = stub();
    const sw = {
        addEventListener,
    };
    
    listenSW(sw, 'hello', 'world');
    
    t.ok(addEventListener.calledWith('hello', 'world'), 'should call addEventListener');
    t.end();
});

test('sw: lesten: no sw', (t) => {
    const {listenSW} = reRequire('./register');
    const [e] = tryCatch(listenSW, null, 'hello', 'world');
    
    t.notOk(e, 'should not throw');
    t.end();
});

test('sw: register: registerSW: no serviceWorker', async (t) => {
    const {navigator} = global;
    global.navigator = {};
    
    const {
        registerSW,
    } = reRequire('./register');
    
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
    
    const register = stub();
    
    global.navigator = getNavigator({
        register,
    });
    
    global.location = {
        protocol: 'http:'
    };
    
    const {registerSW} = reRequire('./register');
    
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
    
    const register = stub();
    
    global.navigator = getNavigator({
        register,
    });
    
    const {registerSW} = reRequire('./register');
    
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
    
    const register = stub();
    
    global.navigator = getNavigator({
        register,
    });
    
    const {registerSW} = reRequire('./register');
    
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
        unregister: stub()
    };
    
    const register = stub()
        .returns(Promise.resolve(reg));
    
    global.navigator = getNavigator({
        register,
    });
    
    const {unregisterSW} = reRequire('./register');
    
    await unregisterSW('/hello');
    
    global.location = location;
    global.navigator = navigator;
    
    t.ok(register.calledWith('/hello/sw.js'), 'should call register');
    t.end();
});

function getNavigator({register, unregister}) {
    unregister = unregister || stub();
    
    return {
        serviceWorker: {
            register,
            unregister,
        }
    };
}
