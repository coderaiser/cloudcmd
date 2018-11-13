'use strict';

const {join} = require('path');
const test = require('tape');

const diff = require('sinon-called-with-diff');
const sinon = diff(require('sinon'));

const dir = join(__dirname, '..', '..');
const modulesPath = join(dir, 'json', 'modules.json');
const cloudcmdPath = dir;

const localModules  = require(modulesPath);
const modulas = require(`${dir}/server/modulas`);

const cloudcmd = require(cloudcmdPath);
const {request} = require('serve-once')(cloudcmd);

test('cloudcmd: modules', async (t) => {
    const modules = {
        data: {
            FilePicker: {
                key: 'hello'
            }
        }
    };
    const options = {
        modules,
    };
    
    const expected = {
        ...localModules,
        ...modules,
    };
    
    const {body} = await request.get(`/json/modules.json`, {
        type: 'json',
        options,
    });
    
    t.deepEqual(body, expected, 'should equal');
    t.end();
});

test('cloudcmd: modules: wrong route', async (t) => {
    const modules = {
        hello: 'world'
    };
    
    const options = {
        modules,
    };
    
    const expected = {
        ...localModules,
        ...modules,
    };
    
    const {body} = await request.get(`/package.json`, {
        type: 'json',
        options,
    });
    
    t.notDeepEqual(body, expected, 'should not be equal');
    t.end();
});

test('cloudcmd: modules: no', (t) => {
    const fn = modulas();
    const url = '/json/modules.json';
    const send = sinon.stub();
    
    fn({url}, {send});
    
    t.ok(send.calledWith(localModules), 'should have been called with modules');
    t.end();
});

