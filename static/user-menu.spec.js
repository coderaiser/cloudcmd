'use strict';

const autoGlobals = require('auto-globals');
const test = autoGlobals(require('supertape'));
const stub = require('@cloudcmd/stub');
const tryToCatch = require('try-to-catch');
const wraptile = require('wraptile');

const defaultMenu = require('./user-menu');

const {create} = autoGlobals;

const {_data} = defaultMenu;
const reject = wraptile(async (a) => {
    throw Error(a);
});

test('cloudcmd: static: user menu: Rename', async (t) => {
    const name = 'F2 - Rename file';
    const DOM = getDOM();
    
    const {renameCurrent} = DOM;
    
    await defaultMenu[name]({
        DOM,
    });
    
    t.ok(renameCurrent.called, 'should call renameCurrent');
    t.end();
});

test('cloudcmd: static: user menu: IO.write', async (t) => {
    const name = 'C - Create User Menu File';
    const DOM = getDOM();
    const CloudCmd = getCloudCmd();
    const {write} = DOM.IO;
    
    await defaultMenu[name]({
        DOM,
        CloudCmd,
    });
    
    const path = '/.cloudcmd.menu.js';
    t.ok(write.calledWith(path, _data), 'should call IO.write');
    t.end();
});

test('cloudcmd: static: user menu: refresh', async (t) => {
    const name = 'C - Create User Menu File';
    const DOM = getDOM();
    const CloudCmd = getCloudCmd();
    const {refresh} = CloudCmd;
    
    await defaultMenu[name]({
        DOM,
        CloudCmd,
    });
    
    t.ok(refresh.calledWith(), 'should call CloudCmd.refresh');
    t.end();
});

test('cloudcmd: static: user menu: setCurrentByName', async (t) => {
    const name = 'C - Create User Menu File';
    const DOM = getDOM();
    const CloudCmd = getCloudCmd();
    const {setCurrentByName} = DOM;
    
    await defaultMenu[name]({
        DOM,
        CloudCmd,
    });
    
    const fileName = '.cloudcmd.menu.js';
    t.ok(setCurrentByName.calledWith(fileName), 'should call DOM.setCurrentByName');
    t.end();
});

test('cloudcmd: static: user menu: EditFile.show', async (t) => {
    const name = 'C - Create User Menu File';
    const DOM = getDOM();
    const CloudCmd = getCloudCmd();
    const {EditFile} = CloudCmd;
    
    await defaultMenu[name]({
        DOM,
        CloudCmd,
    });
    
    t.ok(EditFile.show.called, 'should call EditFile.show');
    t.end();
});

test('cloudcmd: static: user menu: no EditFile.show', async (t) => {
    const name = 'C - Create User Menu File';
    const DOM = getDOM();
    const CloudCmd = getCloudCmd();
    const {IO} = DOM;
    const {EditFile} = CloudCmd;
    
    IO.write = stub(reject('Error'));
    
    await tryToCatch(defaultMenu[name], {
        DOM,
        CloudCmd,
    });
    
    t.notOk(EditFile.show.called, 'should not call EditFile.show');
    t.end();
});

test('cloudcmd: static: user menu: compare directories', async (t) => {
    const name = 'D - Compare directories';
    const DOM = getDOM();
    const CloudCmd = getCloudCmd();
    
    await defaultMenu[name]({
        DOM,
        CloudCmd,
    });
    
    const {files} = DOM.CurrentInfo.files;
    t.ok(DOM.getFilenames.calledWith(files), 'should call getFilenames');
    t.end();
});

function getDOM() {
    const IO = {
        write: stub(),
    };
    
    const CurrentInfo = {
        dirPath: '/',
        files: [],
        filesPasive: [],
        panel: create(),
        panelPassive: create(),
    };
    
    return {
        IO,
        CurrentInfo,
        setCurrentByName: stub(),
        getFilenames: stub().returns([]),
        getCurrentByName: stub(),
        renameCurrent: stub(),
    };
}

function getCloudCmd() {
    return {
        refresh: stub(),
        EditFile: {
            show: stub(),
        },
    };
}

