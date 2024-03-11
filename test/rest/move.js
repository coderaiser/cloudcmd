'use strict';

const fs = require('fs');

const test = require('supertape');
const {Volume} = require('memfs');
const {ufs} = require('unionfs');

const mockRequire = require('mock-require');
const serveOnce = require('serve-once');
const {reRequire, stopAll} = mockRequire;

const cloudcmdPath = '../../';
const dir = `${cloudcmdPath}server/`;
const restPath = `${dir}rest`;

const {assign} = Object;

test('cloudcmd: rest: move', async (t) => {
    const volume = {
        '/fixture/move.txt': 'hello',
        '/fixture/tmp/a.txt': 'a',
    };
    
    const vol = Volume.fromJSON(volume, '/');
    
    const unionFS = ufs
        .use(vol)
        .use(fs);
    
    assign(unionFS, {
        promises: fs.promises,
    });
    mockRequire('fs', unionFS);
    
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
        from: '/fixture/',
        to: '/fixture/tmp/',
        names: ['move.txt'],
    };
    
    const {body} = await request.put(`/api/v1/move`, {
        body: files,
    });
    
    stopAll();
    
    t.equal(body, 'move: ok("["move.txt"]")', 'should move');
    t.end();
});

test('cloudcmd: rest: move: no from', async (t) => {
    const cloudcmd = reRequire(cloudcmdPath);
    const {createConfigManager} = cloudcmd;
    
    const configManager = createConfigManager();
    configManager('auth', false);
    configManager('root', '/');
    
    const {request} = serveOnce(cloudcmd, {
        configManager,
    });
    
    const files = {};
    
    const {body} = await request.put(`/api/v1/move`, {
        body: files,
    });
    
    const expected = '"from" should be filled';
    
    t.equal(body, expected);
    t.end();
});

test('cloudcmd: rest: move: no to', async (t) => {
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
    
    const {body} = await request.put(`/api/v1/move`, {
        body: files,
    });
    
    const expected = '"to" should be filled';
    
    t.equal(body, expected);
    t.end();
});

test('cloudcmd: rest: readonly', async (t) => {
    const cloudcmd = reRequire(cloudcmdPath);
    const {createConfigManager} = cloudcmd;
    
    const configManager = createConfigManager();
    configManager('auth', false);
    configManager('root', '/');
    configManager('readonly', true);
    
    const {request} = serveOnce(cloudcmd, {
        configManager,
    });
    
    const files = {
        from: '/',
    };
    
    const {body} = await request.put(`/api/v1/move`, {
        body: files,
    });
    
    const expected = '"readonly" mode enabled';
    
    t.equal(body, expected);
    t.end();
});
