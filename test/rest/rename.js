'use strict';

const fs = require('node:fs');

const test = require('supertape');
const {Volume} = require('memfs');
const {ufs} = require('unionfs');

const mockRequire = require('mock-require');
const serveOnce = require('serve-once');
const {reRequire, stopAll} = mockRequire;

const cloudcmdPath = '../../';
const dir = `${cloudcmdPath}server/`;
const restPath = `${dir}rest`;

test('cloudcmd: rest: rename', async (t) => {
    const volume = {
        '/fixture/mv.txt': 'hello',
        '/fixture/tmp/a.txt': 'a',
    };
    
    const vol = Volume.fromJSON(volume, '/');
    
    const unionFS = ufs
        .use(vol)
        .use(fs);
    
    mockRequire('node:fs', unionFS);
    
    reRequire('@cloudcmd/rename-files');
    reRequire('@cloudcmd/move-files');
    reRequire(restPath);
    
    const cloudcmd = reRequire(cloudcmdPath);
    const {createConfigManager} = cloudcmd;
    const configManager = createConfigManager();
    
    configManager('auth', false);
    configManager('root', '/');
    
    const {request} = serveOnce(cloudcmd, {
        configManager,
    });
    
    const files = {
        from: '/fixture/mv.txt',
        to: '/fixture/tmp/mv.txt',
    };
    
    const {body} = await request.put(`/api/v1/rename`, {
        body: files,
    });
    
    mockRequire.stopAll();
    
    const expected = 'rename: ok("{"from":"/fixture/mv.txt","to":"/fixture/tmp/mv.txt"}")';
    
    stopAll();
    
    t.equal(body, expected, 'should move');
    t.end();
});

test('cloudcmd: rest: rename: no from', async (t) => {
    const cloudcmd = reRequire(cloudcmdPath);
    const {createConfigManager} = cloudcmd;
    
    const configManager = createConfigManager();
    configManager('auth', false);
    configManager('root', '/');
    
    const {request} = serveOnce(cloudcmd, {
        configManager,
    });
    
    const files = {};
    
    const {body} = await request.put(`/api/v1/rename`, {
        body: files,
    });
    
    const expected = '"from" should be filled';
    
    t.equal(body, expected);
    t.end();
});

test('cloudcmd: rest: rename: no to', async (t) => {
    const cloudcmd = reRequire(cloudcmdPath);
    const {createConfigManager} = cloudcmd;
    
    const configManager = createConfigManager();
    configManager('auth', false);
    configManager('root', '/');
    
    const {request} = serveOnce(cloudcmd, {
        configManager,
    });
    
    const files = {
        from: '/',
    };
    
    const {body} = await request.put(`/api/v1/rename`, {
        body: files,
    });
    
    const expected = '"to" should be filled';
    
    t.equal(body, expected);
    t.end();
});
