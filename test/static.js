'use strict';

const test = require('tape');
const promisify = require('es6-promisify');
const pullout = require('pullout');
const request = require('request');

const before = require('./before');

const warp = (fn, ...a) => (...b) => fn(...b, ...a);

const _pullout = promisify(pullout);

const get = promisify((url, fn) => {
    fn(null, request(url));
});

test('cloudcmd: static', (t) => {
    before({}, (port, after) => {
        const name = 'package.json';
        
        get(`http://localhost:${port}/${name}`)
            .then(warp(_pullout, 'string'))
            .then(JSON.parse)
            .then((json) => {
                t.equal(json.name, 'cloudcmd', 'should download file');
                t.end();
                after();
            })
            .catch((error) => {
                console.log(error);
            });
    });
});

test('cloudcmd: static: not found', (t) => {
    before({}, (port, after) => {
        const name = Math.random();
        get(`http://localhost:${port}/${name}`)
            .then((res) => {
                res.on('response', (res) => {
                    t.equal(res.statusCode, 404, 'should return 404');
                });
                res.on('end', () => {
                    t.end();
                    after();
                });
            })
            .catch((error) => {
                console.log(error);
            });
    });
});

