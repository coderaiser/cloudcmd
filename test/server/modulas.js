'use strict';

const path = require('path');
const test = require('tape');

const diff = require('sinon-called-with-diff');
const sinon = diff(require('sinon'));

const promisify = require('es6-promisify');
const pullout = require('pullout');
const request = require('request');

const dir = path.join(__dirname, '..', '..');
const modulesPath = path.join(dir, 'json', 'modules.json');

const localModules  = require(modulesPath);
const modulas = require(`${dir}/server/modulas`);

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

test('cloudcmd: modules: no', (t) => {
    const fn = modulas();
    const url = '/json/modules.json';
    const send = sinon.stub();
    
    fn({url}, {
        send
    });
    
    t.ok(send.calledWith(localModules), 'should have been called with modules');
    t.end();
});

