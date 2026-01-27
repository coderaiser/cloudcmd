import autoGlobals from 'auto-globals';
import tape from 'supertape';
import {stub} from '@cloudcmd/stub';
import {tryCatch} from 'try-catch';
import {
    listenSW,
    registerSW,
    unregisterSW,
} from './register.mjs';

const test = autoGlobals(tape);

test('sw: listen', (t) => {
    const addEventListener = stub();
    const sw = {
        addEventListener,
    };
    
    listenSW(sw, 'hello', 'world');
    
    t.calledWith(addEventListener, ['hello', 'world'], 'should call addEventListener');
    t.end();
});

test('sw: lesten: no sw', (t) => {
    const [e] = tryCatch(listenSW, null, 'hello', 'world');
    
    t.notOk(e, 'should not throw');
    t.end();
});

test('sw: register: registerSW: no serviceWorker', async (t, {navigator}) => {
    delete navigator.serviceWorker;
    
    await registerSW();
    
    t.pass('should not call register');
    t.end();
});

test('sw: register: registerSW: no https', async (t, {location, navigator}) => {
    const {register} = navigator.serviceWorker;
    
    location.protocol = 'http:';
    
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
    
    const result = await registerSW();
    
    t.notOk(result, 'should not throw');
    t.end();
});

test('sw: register: registerSW', async (t, {location, navigator}) => {
    location.hostname = 'localhost';
    
    const {register} = navigator.serviceWorker;
    await registerSW('/hello');
    
    t.calledWith(register, ['/hello/sw.js'], 'should call register');
    t.end();
});

test('sw: register: unregisterSW', async (t, {location, navigator}) => {
    location.hostname = 'localhost';
    
    const {serviceWorker} = navigator;
    const {register} = serviceWorker;
    
    register.returns(serviceWorker);
    
    await unregisterSW('/hello');
    
    t.calledWith(register, ['/hello/sw.js'], 'should call register');
    t.end();
});
