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

test('cloudcmd: markdown: relative: error', (t) => {
    before((port, after) => {
        get(`http://localhost:${port}/api/v1/markdown/not-found?relative`)
            .then(warp(_pullout, 'string'))
            .then((result) => {
                t.ok(/ENOENT/.test(result), 'should not found');
                t.end();
                after();
            })
            .catch((error) => {
                console.log(error);
            });
    });
});

test('cloudcmd: markdown: relative', (t) => {
    before((port, after) => {
        get(`http://localhost:${port}/api/v1/markdown/HELP.md?relative`)
            .then(warp(_pullout, 'string'))
            .then((result) => {
                t.notOk(/ENOENT/.test(result), 'should not return error');
                t.end();
                after();
            })
            .catch((error) => {
                console.log(error);
            });
    });
});

