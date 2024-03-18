import {createMockImport} from 'mock-import';
import fs from 'node:fs';
import test from 'supertape';
import {Volume} from 'memfs';
import {ufs} from 'unionfs';
import mockRequire from 'mock-require';
import serveOnce from 'serve-once';

const {
    stopAll,
    mockImport,
    reImport,
} = createMockImport(import.meta.url);

const dir = `../../server/`;
const cloudcmdPath = `${dir}cloudcmd.mjs`;
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
    
    mockImport('fs', unionFS);
    
    await reImport('@cloudcmd/rename-files');
    await reImport('@cloudcmd/move-files');
    await reImport(restPath);
    
    const {cloudcmd} = await reImport(cloudcmdPath);
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
    
    mockRequire.stop('fs');
    
    const expected = 'rename: ok("{"from":"/fixture/mv.txt","to":"/fixture/tmp/mv.txt"}")';
    
    stopAll();
    
    t.equal(body, expected, 'should move');
    t.end();
});

test('cloudcmd: rest: rename: no from', async (t) => {
    const {cloudcmd} = await reImport(cloudcmdPath);
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
    const {cloudcmd} = await reImport(cloudcmdPath);
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
