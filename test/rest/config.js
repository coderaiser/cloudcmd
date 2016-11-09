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

const patch = promisify((url, json, fn) => {
    fn(null, request.patch({url, json}));
});

test('cloudcmd: rest: config: get', (t) => {
    before((port, after) => {
        get(`http://localhost:${port}/api/v1/config`)
            .then(warp(_pullout, 'string'))
            .then(JSON.parse)
            .then((config) => {
                t.notOk(config.auth, 'should config.auth to be false');
                t.end();
                after();
            })
            .catch((error) => {
                console.log(error);
            });
    });
});

test('cloudcmd: rest: config: put', (t) => {
    before((port, after) => {
        patch(`http://localhost:${port}/api/v1/config`, {
            json: {
                auth: false
            }
        })
            .then(warp(_pullout, 'string'))
            .then((result) => {
                t.equal(result, 'config: ok("json")', 'should patch config');
                t.end();
                after();
            })
            .catch((error) => {
                console.log(error);
            });
    });
});

