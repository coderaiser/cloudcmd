'use strict';

const path = require('path');
const test = require('tape');

const promisify = require('es6-promisify');
const pullout = require('pullout');
const request = require('request');

const modulesPath = path.join(__dirname, '..', '..', 'json', 'modules.json');
const localModules  = require(modulesPath);

const warp = (fn, ...a) => (...b) => fn(...b, ...a);
const _pullout = promisify(pullout);

const get = promisify((url, fn) => {
    fn(null, request(url));
});

const before = require('../before');

test('cloudcmd: modules', (t) => {
    const modules = {
        data: {
            FilePicker: {
                key: 'hello'
            }
        }
    };
    
    const expected = Object.assign({}, localModules);
    
    expected.data.FilePicker.key = 'hello';
    
    before({modules}, (port, after) => {
        get(`http://localhost:${port}/json/modules.json`)
            .then(warp(_pullout, 'string'))
            .then(JSON.parse)
            .then((result) => {
                t.deepEqual(result, expected, 'should equal');
                t.end();
                after();
            })
            .catch(console.error);
    });
});

test('cloudcmd: modules: wrong route', (t) => {
    const modules = {
        hello: 'world'
    };
    
    const expected = Object.assign({}, localModules, modules);
    
    before({modules}, (port, after) => {
        get(`http://localhost:${port}/package.json`)
            .then(warp(_pullout, 'string'))
            .then(JSON.parse)
            .then((result) => {
                t.notDeepEqual(result, expected, 'should not be equal');
                t.end();
                after();
            })
            .catch(console.error);
    });
});

