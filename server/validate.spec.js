'use strict';

const fs = require('fs');

const test = require('supertape');
const stub = require('@cloudcmd/stub');
const tryCatch = require('try-catch');
const mockRequire = require('mock-require');
const {reRequire} = mockRequire;

const dir = '..';

const validatePath = `${dir}/server/validate`;
const exitPath = `${dir}/server/exit`;
const columnsPath = `${dir}/server/columns`;
const cloudcmdPath = `${dir}/server/cloudcmd`;

const validate = require(validatePath);
const cloudcmd = require(cloudcmdPath);

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

test('validate: root: stat', (t) => {
    const fn = stub();
    const {statSync} = fs;
    
    const error = 'ENOENT';
    fs.statSync = () => {
        throw Error(error);
    };
    
    mockRequire(exitPath, fn);
    
    const {root} = reRequire(validatePath);
    
    root('hello', fn);
    
    const msg = 'cloudcmd --root: %s';
    fs.statSync = statSync;
    
    mockRequire.stop(exitPath);
    t.calledWith(fn, [msg, error], 'should call fn');
    t.end();
});

test('validate: packer: not valid', (t) => {
    const fn = stub();
    
    mockRequire(exitPath, fn);
    
    const {packer} = reRequire(validatePath);
    const msg = 'cloudcmd --packer: could be "tar" or "zip" only';
    
    packer('hello');
    
    mockRequire.stop(exitPath);
    
    t.calledWith(fn, [msg], 'should call fn');
    t.end();
});

test('validate: editor: not valid', (t) => {
    const fn = stub();
    
    mockRequire(exitPath, fn);
    
    const {editor} = reRequire(validatePath);
    const msg = 'cloudcmd --editor: could be "dword", "edward" or "deepword" only';
    
    editor('hello');
    
    mockRequire.stop(exitPath);
    
    t.calledWith(fn, [msg], 'should call fn');
    t.end();
});

test('validate: columns', (t) => {
    const fn = stub();
    mockRequire(exitPath, fn);
    
    const {columns} = require(validatePath);
    
    columns('name-size-date');
    
    mockRequire.stop(exitPath);
    
    t.notOk(fn.called, 'should not call exit');
    t.end();
});

test('validate: columns: wrong', (t) => {
    const fn = stub();
    
    mockRequire(exitPath, fn);
    mockRequire(columnsPath, {
        'name-size-date': '',
        'name-size': '',
    });
    
    const {columns} = reRequire(validatePath);
    const msg = 'cloudcmd --columns: can be only one of: "name-size-date", "name-size"';
    
    columns('hello');
    
    mockRequire.stop(exitPath);
    mockRequire.stop(columnsPath);
    
    t.calledWith(fn, [msg], 'should call exit');
    t.end();
});

