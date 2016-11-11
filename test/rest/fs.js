'use strict';

const test = require('tape');
const promisify = require('es6-promisify');
const pullout = require('pullout');
const request = require('request');

const before = require('../before');

const warp = (fn, ...a) => (...b) => fn(...b, ...a);

const _pullout = promisify(pullout);

const get = promisify((url, fn) => {
    fn(null, request(url));
});

test('cloudcmd: rest: fs: path', (t) => {
    before((port, after) => {
        get(`http://localhost:${port}/api/v1/fs`)
            .then(warp(_pullout, 'string'))
            .then(JSON.parse)
            .then((dir) => {
                t.equal('/', dir.path, 'should dir path be "/"');
                t.end();
                after();
            })
            .catch((error) => {
                console.log(error);
            });
    });
});

