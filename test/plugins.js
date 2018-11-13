'use strict';

const fs = require('fs');
const test = require('tape');
const cloudcmd = require('..');

const config = {
    auth: false,
};

const {request} = require('serve-once')(cloudcmd, {
    config,
});

test('cloudcmd: plugins', async (t) => {
    const plugins = [];
    const options = {
        plugins,
    };
    
    const {body} = await request.get('/plugins.js', {
        options,
    });
    
    t.equal(body, '', 'should content be empty');
    t.end();
});

test('cloudcmd: plugins', async (t) => {
    const plugins = [
        __filename
    ];
    
    const options = {
        plugins,
    };
    
    const {body} = await request.get('/plugins.js', {
        options,
    });
    
    const file = fs.readFileSync(__filename, 'utf8');
    
    t.equal(body, file, 'should return file plugin content');
    t.end();
});

test('cloudcmd: plugins: load error', async (t) => {
    const noEntry = __filename + Math.random();
    const plugins = [
        __filename,
        noEntry
    ];
    
    const msg = `ENOENT: no such file or directory, open '${noEntry}'`;
    
    const options = {
        plugins,
    };
    
    const {body} = await request.get('/plugins.js', {
        options,
    });
    
    const file = fs.readFileSync(__filename, 'utf8') + msg;
    
    t.equal(body, file, 'should return file plugin content');
    t.end();
});

