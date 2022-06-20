import {createMockImport} from 'mock-import';

const {
    stopAll,
    reImport,
    mockImport,
} = createMockImport(import.meta.url);

import fs from 'fs';

import {
    test,
    stub,
} from 'supertape';
import tryCatch from 'try-catch';
const dir = '..';

const validatePath = `${dir}/server/validate`;

import validate from '../server/validate.js';
import cloudcmd from '../server/cloudcmd.mjs';
const columnsPath = `${dir}/server/columns`;

const exitPath = `${dir}/server/exit`;

test('validate: root: bad', (t) => {
    const config = {
        root: Math.random(),
    };
    
    const [e] = tryCatch(cloudcmd, {config});
    
    t.equal(e.message, 'dir should be a string', 'should throw');
    t.end();
});

test('validate: root: config', (t) => {
    const config = stub().returns(true);
    
    validate.root('/hello', config);
    
    t.calledWith(config, ['dropbox'], 'should call config');
    t.end();
});

test('validate: root: /', (t) => {
    const fn = stub();
    validate.root('/', fn);
    
    t.notOk(fn.called, 'should not call fn');
    t.end();
});

test('validate: root: stat', async (t) => {
    const fn = stub();
    const {statSync} = fs;
    
    const error = 'ENOENT';
    fs.statSync = () => {
        throw Error(error);
    };
    
    mockImport(exitPath, fn);
    
    const {root} = await reImport(validatePath);
    
    root('hello', fn);
    
    const msg = 'cloudcmd --root: %s';
    fs.statSync = statSync;
    
    stopAll();
    
    t.calledWith(fn, [msg, error], 'should call fn');
    t.end();
});

test('validate: packer: not valid', async (t) => {
    const fn = stub();
    
    mockImport(exitPath, fn);
    
    const {packer} = await reImport(validatePath);
    const msg = 'cloudcmd --packer: could be "tar" or "zip" only';
    
    packer('hello');
    
    stopAll();
    
    t.calledWith(fn, [msg], 'should call fn');
    t.end();
});

test('validate: editor: not valid', async (t) => {
    const fn = stub();
    
    mockImport(exitPath, fn);
    
    const {editor} = await reImport(validatePath);
    const msg = 'cloudcmd --editor: could be "dword", "edward" or "deepword" only';
    
    editor('hello');
    
    stopAll();
    
    t.calledWith(fn, [msg], 'should call fn');
    t.end();
});

test('validate: columns', async (t) => {
    const fn = stub();
    mockImport(exitPath, fn);
    
    const {columns} = await import(validatePath);
    
    columns('name-size-date');
    
    stopAll();
    
    t.notOk(fn.called, 'should not call exit');
    t.end();
});

test('validate: columns: wrong', async (t) => {
    const fn = stub();
    
    mockImport(exitPath, fn);
    mockImport(columnsPath, {
        'name-size-date': '',
        'name-size': '',
    });
    
    const {columns} = await reImport(validatePath);
    const msg = 'cloudcmd --columns: can be only one of: "name-size-date", "name-size"';
    
    columns('hello');
    
    stopAll();
    
    t.calledWith(fn, [msg], 'should call exit');
    t.end();
});

