'use strict';

const fs = require('fs');
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

test('cloudcmd: plugins', (t) => {
    const plugins = [];
    
    before({plugins}, (port, after) => {
        get(`http://localhost:${port}/plugins.js`)
            .then(warp(_pullout, 'string'))
            .then((content) => {
                t.equal(content, '', 'should content be empty');
                t.end();
                after();
            })
            .catch((error) => {
                console.log(error);
            });
    });
});

test('cloudcmd: plugins', (t) => {
    const plugins = [
        __filename
    ];
    
    before({plugins}, (port, after) => {
        get(`http://localhost:${port}/plugins.js`)
            .then(warp(_pullout, 'string'))
            .then((content) => {
                const file = fs.readFileSync(__filename, 'utf8');
                t.equal(content, file, 'should return file plugin content');
                t.end();
                after();
            })
            .catch((error) => {
                console.log(error);
            });
    });
});

test('cloudcmd: plugins: load error', (t) => {
    const noEntry = __filename + Math.random();
    const plugins = [
        __filename,
        noEntry
    ];
    
    const msg = `ENOENT: no such file or directory, open '${noEntry}'`;
    
    before({plugins}, (port, after) => {
        get(`http://localhost:${port}/plugins.js`)
            .then(warp(_pullout, 'string'))
            .then((content) => {
                const file = fs.readFileSync(__filename, 'utf8') + msg;
                t.equal(content, file, 'should return file plugin content');
                t.end();
                after();
            })
            .catch((error) => {
                console.log(error);
            });
    });
});

