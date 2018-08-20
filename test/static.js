'use strict';

const test = require('tape');
const {promisify} = require('es6-promisify');
const pullout = require('pullout');
const request = require('request');

const configFn = require('../server/config');
const {connect} = require('./before');

const warp = (fn, ...a) => (...b) => fn(...b, ...a);

const _pullout = promisify(pullout);

const get = promisify((url, options, fn) => {
    if (!fn) {
        fn = options;
        options = {};
    }
    
    fn(null, request(url, options));
});

test('cloudcmd: static', async (t) => {
    const {port, done} = await connect();
    const name = 'package.json';
    
    get(`http://localhost:${port}/${name}`)
        .then(warp(_pullout, 'string'))
        .then(JSON.parse)
        .then((json) => {
            t.equal(json.name, 'cloudcmd', 'should download file');
            t.end();
        })
        .catch(console.error)
        .then(done);
});

test('cloudcmd: static: not found', async (t) => {
    const name = Math.random();
    
    const {port, done} = await connect({});
    const res = await get(`http://localhost:${port}/${name}`);
    
    res.on('response', (res) => {
        t.equal(res.statusCode, 404, 'should return 404');
    });
    
    res.on('error', console.error);
    res.on('end', async () => {
        await done();
        t.end();
    });
});

test('cloudcmd: prefix: wrong', async (t) => {
    const originalPrefix = configFn('prefix');
    
    const {port, done} = await connect({
        config: {
            prefix: '/hello'
        }
    });
    
    const name = Math.random();
    const res = await get(`http://localhost:${port}/${name}`);
    
    res.on('response', async ({statusCode}) => {
        await done();
        configFn('prefix', originalPrefix);
        
        console.log(require('../server/config')('prefix'));
        
        t.equal(statusCode, 404, 'should return 404');
        t.end();
    });
});

test('cloudcmd: /cloudcmd.js', async (t) => {
    const name = 'cloudcmd.js';
    
    const {port, done} = await connect();
    const res = await get(`http://localhost:${port}/${name}`);
    
    res.on('response', ({statusCode}) => {
        t.equal(statusCode, 200, 'should return OK');
    });
    
    res.on('end', async () => {
        await done();
        t.end();
    });
});

test('cloudcmd: /cloudcmd.js: auth: access denied', async (t) => {
    const name = 'cloudcmd.js';
    const config = {
        auth: true
    };
    
    const {port, done} = await connect({config});
    const res = await get(`http://localhost:${port}/${name}`);
    
    res.on('response', ({statusCode}) => {
        t.equal(statusCode, 401, 'should return auth');
    });
    
    res.on('end', async () => {
        await done();
        t.end();
    });
});

test('cloudcmd: /cloudcmd.js: auth: no password', async (t) => {
    const name = 'cloudcmd.js';
    
    const config = {
        auth: true
    };
    
    const auth = {
        username: configFn('username'),
    };
    
    const {port, done} = await connect({config});
    const res = await get(`http://localhost:${port}/${name}`, {auth});
    
    res.on('response', ({statusCode}) => {
        t.equal(statusCode, 401, 'should return auth');
    });
    res.on('end', async () => {
        await done();
        t.end();
    });
});

test('cloudcmd: /cloudcmd.js: auth: access granted', async (t) => {
    const name = 'cloudcmd.js';
    const config = {
        auth: true
    };
    const auth = {
        username: configFn('username'),
        password: configFn('password'),
    };
    
    const {port, done} = await connect({config});
    const res = await get(`http://localhost:${port}/${name}`, {auth});
    
    res.on('response', ({statusCode}) => {
        t.equal(statusCode, 401, 'should return auth');
    });
    
    res.on('end', async () => {
        await done();
        t.end();
    });
});

test('cloudcmd: /logout', async (t) => {
    const name = 'logout';
    const {port, done} = await connect();
    const res = await get(`http://localhost:${port}/${name}`);
    
    res.on('response', ({statusCode}) => {
        t.equal(statusCode, 401, 'should return 401');
    });
    res.on('end', async () => {
        await done();
        t.end();
    });
});

