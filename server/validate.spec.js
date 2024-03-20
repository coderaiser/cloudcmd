'use strict';

const fs = require('node:fs');

const {test, stub} = require('supertape');

const tryCatch = require('try-catch');
const mockRequire = require('mock-require');
const dir = '..';

const validatePath = `${dir}/server/validate`;

const cloudcmdPath = `${dir}/server/cloudcmd`;
const validate = require(validatePath);
const cloudcmd = require(cloudcmdPath);
const columnsPath = `${dir}/server/columns`;

const exitPath = `${dir}/server/exit`;
const {reRequire, stopAll} = mockRequire;

test('validate: root: bad', (t) => {
    const config = {
        root: Math.random(),
    };
    
    const [e] = tryCatch(cloudcmd, {
        config,
    });
    
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
    
    t.notCalled(fn, 'should not call fn');
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
    
    stopAll();
    
    t.calledWith(fn, [msg, error], 'should call fn');
    t.end();
});

test('validate: packer: not valid', (t) => {
    const fn = stub();
    
    mockRequire(exitPath, fn);
    
    const {packer} = reRequire(validatePath);
    const msg = 'cloudcmd --packer: could be "tar" or "zip" only';
    
    packer('hello');
    
    stopAll();
    
    t.calledWith(fn, [msg], 'should call fn');
    t.end();
});

test('validate: editor: not valid', (t) => {
    const fn = stub();
    
    mockRequire(exitPath, fn);
    
    const {editor} = reRequire(validatePath);
    const msg = 'cloudcmd --editor: could be "dword", "edward" or "deepword" only';
    
    editor('hello');
    
    stopAll();
    
    t.calledWith(fn, [msg], 'should call fn');
    t.end();
});

test('validate: columns', (t) => {
    const fn = stub();
    mockRequire(exitPath, fn);
    
    const {columns} = require(validatePath);
    
    columns('name-size-date');
    
    stopAll();
    
    t.notCalled(fn, 'should not call exit');
    t.end();
});

test('validate: columns: wrong', (t) => {
    const fn = stub();
    const getColumns = stub().returns({
        'name-size-date': '',
        'name-size': '',
    });
    
    mockRequire(exitPath, fn);
    mockRequire(columnsPath, {
        getColumns,
    });
    
    const {columns} = reRequire(validatePath);
    const msg = 'cloudcmd --columns: can be only one of: "name-size-date", "name-size"';
    
    columns('hello');
    
    stopAll();
    
    t.calledWith(fn, [msg], 'should call exit');
    t.end();
});
