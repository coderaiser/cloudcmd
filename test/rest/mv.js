'use strict';

const fs = require('fs');

const test = require('supertape');
const {Volume} = require('memfs');
const {ufs} = require('unionfs');

const mockRequire = require('mock-require');
const {reRequire} = mockRequire;
const serveOnce = require('serve-once');

const cloudcmdPath = '../../';
const dir = cloudcmdPath + 'server/';
const restPath = dir + 'rest';

test('cloudcmd: rest: mv', async (t) => {
    const volume = {
        '/fixture/mv.txt': 'hello',
        '/fixture/tmp/a.txt': 'a',
    };
    
    const vol = Volume.fromJSON(volume, '/');
    
    const unionFS = ufs
        .use(vol)
        .use(fs);
    
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
        names: [
            'mv.txt',
        ],
    };
    
    const {body} = await request.put(`/api/v1/mv`, {
        body: files,
    });
    
    mockRequire.stop('fs');
    
    t.equal(body, 'move: ok("["mv.txt"]")', 'should move');
    t.end();
});

test('cloudcmd: rest: mv: rename', async (t) => {
    const volume = {
        '/fixture/mv.txt': 'hello',
        '/fixture/tmp/a.txt': 'a',
    };
    
    const vol = Volume.fromJSON(volume, '/');
    
    const unionFS = ufs
        .use(vol)
        .use(fs);
    
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
        from: '/fixture/mv.txt',
        to: '/fixture/tmp/mv.txt',
    };
    
    const {body} = await request.put(`/api/v1/mv`, {
        body: files,
    });
    
    mockRequire.stop('fs');
    
    const expected = 'move: ok("{"from":"/fixture/mv.txt","to":"/fixture/tmp/mv.txt"}")';
    
    t.equal(body, expected, 'should move');
    t.end();
});

