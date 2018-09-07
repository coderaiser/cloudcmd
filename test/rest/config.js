'use strict';

const path = require('path');
const os = require('os');

const test = require('tape');
const {promisify} = require('es6-promisify');
const pullout = require('pullout');
const request = require('request');
const readjson = require('readjson');
const writejson = require('writejson');

const manageConfig = require('../../server/config');
const {connect} = require('../before');

const warp = (fn, ...a) => (...b) => fn(...b, ...a);

const _pullout = promisify(pullout);

const pathConfig = path.join(os.homedir(), '.cloudcmd.json');

const get = promisify((url, fn) => {
    fn(null, request(url));
});

const patch = promisify((url, json, fn) => {
    fn(null, request.patch({url, json}));
});

test('cloudcmd: rest: config: get', async (t) => {
    const {port, done} = await connect();
    
    const config = await get(`http://localhost:${port}/api/v1/config`)
        .then(warp(_pullout, 'string'))
        .then(JSON.parse)
        .catch(console.error);
    
    await done();
    
    t.notOk(config.auth, 'should config.auth to be false');
    t.end();
});

test('cloudcmd: rest: config: patch', async (t) => {
    const configDialog = true;
    const config = {
        configDialog,
    };
    
    const {port, done} = await connect({config});
    const json = {
        auth: false,
    };
    
    const result = await patch(`http://localhost:${port}/api/v1/config`, json)
        .then(warp(_pullout, 'string'))
        .catch(console.error);
    
    await done();
    
    t.equal(result, 'config: ok("auth")', 'should patch config');
    t.end();
});

test('cloudcmd: rest: config: patch: no configDialog', async (t) => {
    const config = {
        configDialog: false
    };
    
    const {port, done} = await connect({config});
    const json = {
        ip: null
    };
     
    const result = await patch(`http://localhost:${port}/api/v1/config`, json)
        .then(warp(_pullout, 'string'))
        .catch(console.error);
    
    await done();
    
    t.equal(result, 'Config is disabled', 'should return error');
    t.end();
});

test('cloudcmd: rest: config: patch: no configDialog: statusCode', async (t) => {
    const config = {
        configDialog: false
    };
    
    const {port, done} = await connect({config});
    const json = {
        ip: null,
    };
    
    const result = await patch(`http://localhost:${port}/api/v1/config`, json)
        .catch((error) => {
            console.log(error);
        });
     
    result.on('response', async (response) => {
        manageConfig('configDialog', true);
        
        await done();
        t.equal(response.statusCode, 404);
        t.end();
    });
});

test('cloudcmd: rest: config: patch: save config', async (t) => {
    const {port, done} = await connect();
    const json = {
        editor: 'dword',
    };
    
    const originalConfig = readjson.sync.try(pathConfig);
    
    await patch(`http://localhost:${port}/api/v1/config`, json)
        .then(warp(_pullout, 'string'))
        .catch(console.error);
         
    const config = readjson.sync(pathConfig);
   
    await done();
    
    t.equal(config.editor, 'dword', 'should change config file on patch');
    t.end();
    
    if (originalConfig)
        writejson.sync(pathConfig, originalConfig);
});

