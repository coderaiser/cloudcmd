import {createMockImport} from 'mock-import';

import fs from 'fs';

import test from 'supertape';
import {Volume} from 'memfs';
import {ufs} from 'unionfs';

import serveOnce from 'serve-once';

const {
    reImport,
    mockImport,
    stopAll,
} = createMockImport(import.meta.url);

const cloudcmdPath = '../../';
const dir = cloudcmdPath + 'server/';
const restPath = dir + 'rest';

const {assign} = Object;

test('cloudcmd: rest: move', async (t) => {
    const {cloudcmd, createConfigManager} = await reImport('../../server/cloudcmd.mjs');
    
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
            'move.txt',
        ],
    };
    
    const {body} = await request.put(`/api/v1/move`, {
        body: files,
    });
    
    stopAll();
    
    t.equal(body, `ENOENT: no such file or directory, opendir '/fixture/move.txt'`);
    t.end();
});

test('cloudcmd: rest: move: no from', async (t) => {
    const {cloudcmd, createConfigManager} = await reImport('../../server/cloudcmd.mjs');
    
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
    const {cloudcmd, createConfigManager} = await reImport('../../server/cloudcmd.mjs');
    
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
