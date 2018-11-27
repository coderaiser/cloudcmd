'use strict';

const tryTo = require('try-to-tape');
const autoGlobals = require('auto-globals');
const tape = require('tape');

const test = autoGlobals(tryTo(tape));

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
    const {
        registerSW,
    } = reRequire('./register');
    
    await registerSW();
    
    t.pass('should not call register');
    t.end();
});

test('sw: register: registerSW: no https', async (t, {location, navigator}) => {
    const {register} = navigator.serviceWorker;
    
    location.protocol = 'http:';
    
    const {registerSW} = reRequire('./register');
    
    await registerSW();
    
    t.notOk(register.called, 'should not call register');
    t.end();
});

test('sw: register: registerSW: http', async (t, {location, navigator}) => {
    Object.assign(location, {
        protocol: 'http:',
        hostname: 'cloudcmd.io',
    });
    
    const {register} = navigator.serviceWorker;
    
    const {registerSW} = reRequire('./register');
    
    await registerSW();
    
    t.notOk(register.called, 'should not call register');
    t.end();
});

test('sw: register: registerSW', async (t, {location, navigator}) => {
    location.hostname = 'localhost';
    
    const {register} = navigator.serviceWorker;
    const {registerSW} = reRequire('./register');
    
    await registerSW('/hello');
    
    t.ok(register.calledWith('/hello/sw.js'), 'should call register');
    t.end();
});

test('sw: register: unregisterSW', async (t, {location, navigator}) => {
    location.hostname = 'localhost';
    
    const {serviceWorker} = navigator;
    const {register} = serviceWorker;
    
    register.returns(serviceWorker);
    
    const {unregisterSW} = reRequire('./register');
    
    await unregisterSW('/hello');
    
    t.ok(register.calledWith('/hello/sw.js'), 'should call register');
    t.end();
});

