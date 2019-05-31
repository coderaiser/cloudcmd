'use strict';

const test = require('supertape');

const cloudcmd = require('../..');
const configManager = cloudcmd.createConfigManager();

const {request} = require('serve-once')(cloudcmd, {
    config: {
        auth: false,
    },
    configManager,
});

test('cloudcmd: rest: config: get', async (t) => {
    const {body} = await request.get('/api/v1/config', {
        type: 'json',
    });
    
    t.notOk(body.auth, 'should config.auth to be false');
    t.end();
});

test('cloudcmd: rest: config: patch', async (t) => {
    const configDialog = true;
    const config = {
        configDialog,
    };
    
    const options = {
        config,
    };
    
    const json = {
        auth: false,
    };
    
    const res = await request.patch('/api/v1/config', {
        options,
        body: json,
    });
    
    const result = res.body;
    
    t.equal(result, 'config: ok("auth")', 'should patch config');
    t.end();
});

test('cloudcmd: rest: config: patch: no configDialog', async (t) => {
    const config = {
        configDialog: false,
    };
    
    const options = {
        config,
    };
    
    const body = {
        ip: null,
    };
    
    const result = await request.patch(`/api/v1/config`, {
        body,
        options,
    });
    
    t.equal(result.body, 'Config is disabled', 'should return error');
    t.end();
});

test('cloudcmd: rest: config: patch: no configDialog: statusCode', async (t) => {
    const config = {
        configDialog: false,
    };
    
    const options = {
        config,
    };
    
    const body = {
        ip: null,
    };
    
    const response = await request.patch(`/api/v1/config`, {
        body,
        options,
    });
    
    configManager('configDialog', true);
    
    t.equal(response.status, 404);
    t.end();
});

test('cloudcmd: rest: config: patch: save config', async (t) => {
    const body = {
        editor: 'dword',
    };
    
    await request.patch(`/api/v1/config`, {
        body,
    });
    
    t.equal(configManager('editor'), 'dword', 'should change config file on patch');
    t.end();
});

