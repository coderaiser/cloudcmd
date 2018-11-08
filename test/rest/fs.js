'use strict';

const tryToTape = require('try-to-tape');
const test = tryToTape(require('tape'));

const cloudcmd = require('../..');
const {request} = require('serve-once')(cloudcmd);

test('cloudcmd: rest: fs: path', async (t) => {
    const {body} = await request.get(`/api/v1/fs`);
    const {path} = JSON.parse(body);
    
    t.equal('/', path, 'should dir path be "/"');
    t.end();
});

