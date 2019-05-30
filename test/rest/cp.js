'use strict';

const {mkdirSync} = require('fs');
const {join} = require('path');
const test = require('supertape');
const rimraf = require('rimraf');

const fixtureDir = join(__dirname, '..', 'fixture') + '/';
const config = {
    root: join(__dirname, '..'),
};

const cloudcmd = require('../..');
const configManager = cloudcmd.createConfigManager();
configManager('auth', false);

const {request} = require('serve-once')(cloudcmd, {
    config,
    configManager,
});

test('cloudcmd: rest: cp', async (t) => {
    const tmp = join(fixtureDir, 'tmp');
    const files = {
        from: '/fixture/',
        to: '/fixture/tmp',
        names: [
            'cp.txt',
        ],
    };
    
    mkdirSync(tmp);
    
    const {body} = await request.put(`/api/v1/cp`, {
        body: files,
    });
    
    rimraf.sync(tmp);
    
    t.equal(body, 'copy: ok("["cp.txt"]")', 'should return result');
    t.end();
});

