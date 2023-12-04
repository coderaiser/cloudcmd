'use strict';

const autoGlobals = require('auto-globals');
const tape = require('supertape');

const stub = require('@cloudcmd/stub');

const tryCatch = require('try-catch');
const {reRequire} = require('mock-require');
const test = autoGlobals(tape);

test('sw: listen', (t) => {
    const {listenSW} = reRequire('./register');
    const addEventListener = stub();
    const sw = {
        addEventListener,
    };
    
    listenSW(sw, 'hello', 'world');
    
    t.calledWith(addEventListener, ['hello', 'world'], 'should call addEventListener');
    t.end();
});

test('sw: lesten: no sw', (t) => {
    const {listenSW} = reRequire('./register');
    const [e] = tryCatch(listenSW, null, 'hello', 'world');
    
    t.notOk(e, 'should not throw');
    t.end();
});

test('sw: register: registerSW: no serviceWorker', async (t, {navigator}) => {
    const {registerSW} = reRequire('./register');
    
    delete navigator.serviceWorker;
    
    await registerSW();
    
    t.pass('should not call register');
    t.end();
});

test('sw: register: registerSW: no https', async (t, {location, navigator}) => {
    const {register} = navigator.serviceWorker;
    
    location.protocol = 'http:';
    
    const {registerSW} = reRequire('./register');
    
    await registerSW();
    
    t.notCalled(register, 'should not call register');
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
    
    t.notCalled(register, 'should not call register');
    t.end();
});

test('sw: register: registerSW: https self-signed', async (t, {location, navigator}) => {
    Object.assign(location, {
        protocol: 'https',
        hostname: 'self-signed.badssl.com',
    });
    
    const {register} = navigator.serviceWorker;
    register.throws(Error('Cannot register service worker!'));
    
    const {registerSW} = reRequire('./register');
    
    const result = await registerSW();
    
    t.notOk(result, 'should not throw');
    t.end();
});

test('sw: register: registerSW', async (t, {location, navigator}) => {
    location.hostname = 'localhost';
    
    const {register} = navigator.serviceWorker;
    const {registerSW} = reRequire('./register');
    
    await registerSW('/hello');
    
    t.calledWith(register, ['/hello/sw.js'], 'should call register');
    t.end();
});

test('sw: register: unregisterSW', async (t, {location, navigator}) => {
    location.hostname = 'localhost';
    
    const {serviceWorker} = navigator;
    const {register} = serviceWorker;
    
    register.returns(serviceWorker);
    
    const {unregisterSW} = reRequire('./register');
    
    await unregisterSW('/hello');
    
    t.calledWith(register, ['/hello/sw.js'], 'should call register');
    t.end();
});
