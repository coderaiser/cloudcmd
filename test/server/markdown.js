'use strict';

const test = require('tape');
const promisify = require('es6-promisify');
const pullout = require('pullout');
const request = require('request');

const markdown = require('../../server/markdown');

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

test('cloudcmd: markdown: no name', (t) => {
    t.throws(markdown, /name should be string!/, 'should throw when no name');
    t.end();
});

test('cloudcmd: markdown: no request', (t) => {
    const fn = () => markdown('hello');
    
    t.throws(fn, /request could not be empty!/, 'should throw when no request');
    t.end();
});

test('cloudcmd: markdown: no function', (t) => {
    const fn = () => markdown('hello', {});
    
    t.throws(fn, /callback should be function!/, 'should throw when no callback');
    t.end();
});

