'use strict';

const {
    join,
} = require('path');
const test = require('tape');
const {promisify} = require('es6-promisify');
const pullout = require('pullout');
const request = require('request');
const before = require('../before');
const rimraf = require('rimraf');
const mkdirp = require('mkdirp');

const fixtureDir = join(__dirname, '..', 'fixture') + '/';

const warp = (fn, ...a) => (...b) => fn(...b, ...a);
const _pullout = promisify(pullout);

const put = promisify((url, json, fn) => {
    fn(null, request.put(url, {
        json,
    }));
});

test('cloudcmd: rest: cp', (t) => {
    before({}, (port, after) => {
        const tmp = join(fixtureDir, 'tmp');
        const files = {
            from: '/fixture/',
            to: '/fixture/tmp',
            names: [
                'cp.txt'
            ]
        };
        
        mkdirp.sync(tmp);
        
        const rmTmp = () => rimraf.sync(tmp);
        
        put(`http://localhost:${port}/api/v1/cp`, files)
            .then(warp(_pullout, 'string'))
            .then((body) => {
                t.equal(body, 'copy: ok("["cp.txt"]")', 'should return result');
                t.end();
                
                after();
            })
            .catch(console.error)
            .then(rmTmp);
    });
});

