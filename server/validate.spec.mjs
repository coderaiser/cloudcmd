import {test, stub} from 'supertape';
import {tryCatch} from 'try-catch';
import * as validate from './validate.mjs';
import cloudcmd from './cloudcmd.mjs';

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
    const config = stub();
    const error = 'ENOENT';
    const statSync = stub().throws(Error(error));
    const exit = stub();
    
    validate.root('hello', config, {
        statSync,
        exit,
    });
    
    const msg = 'cloudcmd --root: %s';
    
    t.calledWith(exit, [msg, error], 'should call fn');
    t.end();
});

test('validate: packer: not valid', (t) => {
    const exit = stub();
    const msg = 'cloudcmd --packer: could be "tar" or "zip" only';
    
    validate.packer('hello', {
        exit,
    });
    
    t.calledWith(exit, [msg], 'should call fn');
    t.end();
});

test('validate: editor: not valid', (t) => {
    const exit = stub();
    const msg = 'cloudcmd --editor: could be "dword", "edward" or "deepword" only';
    
    validate.editor('hello', {
        exit,
    });
    
    t.calledWith(exit, [msg], 'should call fn');
    t.end();
});

test('validate: columns', (t) => {
    const exit = stub();
    
    validate.columns('name-size-date', {
        exit,
    });
    
    t.notCalled(exit, 'should not call exit');
    t.end();
});

test('validate: columns: wrong', (t) => {
    const getColumns = stub().returns({
        'name-size-date': '',
        'name-size': '',
    });
    
    const exit = stub();
    const msg = 'cloudcmd --columns: can be only one of: "name-size-date", "name-size"';
    
    validate.columns('hello', {
        exit,
        getColumns,
    });
    
    t.calledWith(exit, [msg], 'should call exit');
    t.end();
});

test('validate: theme', (t) => {
    const exit = stub();
    
    validate.theme('dark', {
        exit,
    });
    
    t.notCalled(exit, 'should not call exit');
    t.end();
});

test('validate: theme: wrong', (t) => {
    const getThemes = stub().returns({
        light: '',
        dark: '',
    });
    
    const exit = stub();
    const msg = 'cloudcmd --theme: can be only one of: "light", "dark"';
    
    validate.theme('hello', {
        exit,
        getThemes,
    });
    
    t.calledWith(exit, [msg], 'should call exit');
    t.end();
});
