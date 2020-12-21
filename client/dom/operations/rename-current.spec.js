'use strict';

const test = require('supertape');
const stub = require('@cloudcmd/stub');
const mockRequire = require('mock-require');

const {reRequire} = mockRequire;

test('cloudcmd: client: dom: renameCurrent: isCurrentFile', async (t) => {
    const current = {};
    const isCurrentFile = stub();
    
    mockRequire('../dialog', stubDialog());
    mockRequire('../current-file', stubCurrentFile({
        isCurrentFile,
    }));
    
    const renameCurrent = reRequire('./rename-current');
    await renameCurrent(current);
    
    t.calledWith(isCurrentFile, [current], 'should call isCurrentFile');
    t.end();
});

test('cloudcmd: client: dom: renameCurrent: file exist', async (t) => {
    const current = {};
    const name = 'hello';
    const {CloudCmd} = global;
    
    const CloudCmdStub = {
        refresh: stub(),
    };
    
    global.CloudCmd = CloudCmdStub;
    
    const prompt = stub().returns([null, name]);
    const confirm = stub().returns([true]);
    
    const getCurrentByName = stub().returns(current);
    const getCurrentType = stub().returns('directory');
    
    mockRequire('../dialog', stubDialog({
        confirm,
        prompt,
    }));
    
    mockRequire('../current-file', stubCurrentFile({
        getCurrentByName,
        getCurrentType,
    }));
    
    const renameCurrent = reRequire('./rename-current');
    await renameCurrent();
    
    const expected = 'Directory "hello" already exists. Proceed?';
    global.CloudCmd = CloudCmd;
    
    t.calledWith(confirm, [expected], 'should call confirm');
    t.end();
});

const stubDialog = (fns = {}) => {
    const {
        alert = stub().returns([]),
        confirm = stub().returns([]),
        prompt = stub().returns([]),
    } = fns;
    
    return {
        alert,
        confirm,
        prompt,
    };
};

const stubCurrentFile = (fns = {}) => {
    const {
        isCurrentFile = stub(),
        getCurrentName = stub(),
        getCurrentFile = stub(),
        getCurrentByName = stub(),
        getCurrentType = stub(),
        getCurrentDirPath = stub(),
        setCurrentName = stub(),
    } = fns;
    
    return {
        isCurrentFile,
        getCurrentName,
        getCurrentFile,
        getCurrentByName,
        getCurrentType,
        getCurrentDirPath,
        setCurrentName,
    };
};

