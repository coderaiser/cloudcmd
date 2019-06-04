'use strict';

const test = require('supertape');
const criton = require('criton');

const cloudcmd = require('..');
const configFn = cloudcmd.createConfigManager();

const config = {
    auth: false,
};
const {request} = require('serve-once')(cloudcmd, {
    config,
});

test('cloudcmd: static', async (t) => {
    const name = 'package.json';
    const {body} = await request.get(`/${name}`, {
        type: 'json',
    });
    
    t.equal(body.name, 'cloudcmd', 'should download file');
    t.end();
});

test('cloudcmd: static: not found', async (t) => {
    const name = Math.random();
    const {status} = await request.get(`/${name}`);
    
    t.equal(status, 404, 'should return 404');
    t.end();
});

test('cloudcmd: prefix: wrong', async (t) => {
    const originalPrefix = configFn('prefix');
    const config = {
        prefix: '/hello',
    };
    
    const options = {
        config,
    };
    
    const name = Math.random();
    const {status} = await request.get(`/${name}`, {
        options,
    });
    
    configFn('prefix', originalPrefix);
    
    t.equal(status, 404, 'should return 404');
    t.end();
});

test('cloudcmd: /cloudcmd.js', async (t) => {
    const name = 'cloudcmd.js';
    const {status} = await request.get(`/${name}`);
    
    t.equal(status, 200, 'should return OK');
    t.end();
});

test('cloudcmd: /cloudcmd.js: auth: access denied', async (t) => {
    const name = 'cloudcmd.js';
    const config = {
        auth: true,
    };
    const options = {
        config,
    };
    
    const {status} = await request.get(`/${name}`, {
        options,
    });
    
    t.equal(status, 401, 'should return auth');
    t.end();
});

test('cloudcmd: /cloudcmd.js: auth: no password', async (t) => {
    const name = 'cloudcmd.js';
    const username = 'hello';
    const config = {
        auth: true,
        username,
    };
    const options = {
        config,
    };
    
    const encoded = Buffer.from(`${username}:`).toString('base64');
    const authorization = `Basic ${encoded}`;
    
    const {status} = await request.get(`/${name}`, {
        headers: {
            authorization,
        },
        options,
    });
    
    t.equal(status, 401, 'should return auth');
    t.end();
});

test('cloudcmd: /cloudcmd.js: auth: access granted', async (t) => {
    const name = 'cloudcmd.js';
    const username = 'hello';
    const password = 'world';
    const algo = configFn('algo');
    const config = {
        auth: true,
        username,
        password: criton(password, algo),
    };
    const options = {
        config,
    };
    
    const encoded = Buffer
        .from(`${username}:${password}`)
        .toString('base64');
    
    const authorization = `Basic ${encoded}`;
    
    const {status} = await request.get(`/${name}`, {
        headers: {
            authorization,
        },
        options,
    });
    
    t.equal(status, 200, 'should return auth');
    t.end();
});

test('cloudcmd: /logout', async (t) => {
    const name = 'logout';
    const {status} = await request.get(`/${name}`);
    
    t.equal(status, 401, 'should return 401');
    t.end();
});

