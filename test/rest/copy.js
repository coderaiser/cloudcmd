'use strict';

const {mkdirSync} = require('fs');
const {join} = require('path');
const test = require('supertape');
const rimraf = require('rimraf');

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

const fixtureDir = join(__dirname, '..', 'fixture') + '/';

test('cloudcmd: rest: copy', async (t) => {
    const tmp = join(fixtureDir, 'tmp');
    const files = {
        from: '/fixture/',
        to: '/fixture/tmp',
        names: [
            'copy.txt',
        ],
    };
    
    mkdirSync(tmp);
    
    const {body} = await request.put(`/api/v1/copy`, {
        body: files,
    });
    
    rimraf.sync(tmp);
    
    t.equal(body, 'copy: ok("["copy.txt"]")', 'should return result');
    t.end();
});

