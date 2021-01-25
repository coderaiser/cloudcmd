'use strict';

const test = require('supertape');

const cloudcmd = require('../..');
const {request} = require('serve-once')(cloudcmd, {
    config: {
        auth: false,
    },
});

test('cloudcmd: rest: fs: path', async (t) => {
    const {body} = await request.get(`/api/v1/fs`, {
        type: 'json',
    });
    
    const {path} = body;
    
    t.equal(path, '/', 'should dir path be "/"');
    t.end();
});

