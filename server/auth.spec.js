'use strict';

const test = require('tape');
const diff = require('sinon-called-with-diff');
const sinon = diff(require('sinon'));
const ky = require('ky');

const {connect} = require('../test/before');

const authPath = './auth';

test.only('config: manage: get', async (t) => {
    const auth = false;
    const config = {
        auth,
    };
    
    const {done} = await connect({
        config,
    });
    
    const [, result] = await ky.get('/dist/sw.js');
    
    await done();
    
    t.ok(result, 'should return service worker file without an auth');
    t.end();
});

