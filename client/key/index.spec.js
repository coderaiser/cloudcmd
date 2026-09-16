import autoGlobals from 'auto-globals';
import supertape from 'supertape';
import {ESC, INSERT} from './key.js';
import {
    Key,
    _listener,
    _switchKey,
} from './index.js';
import {getDOM, getCloudCmd} from './vim/globals.fixture.js';

const test = autoGlobals(supertape);
const {stub} = supertape;
const noop = () => {};

globalThis.DOM = getDOM();
globalThis.CloudCmd = getCloudCmd();

test('cloudcmd: client: key: enable vim', async (t) => {
    const vim = stub();
    const config = stub().returns(true);
    const _config = stub();
    
    const event = {
        keyCode: ESC,
        key: 'Escape',
        altKey: false,
    };
    
    Key.setBind();
    
    await _listener(event, {
        vim,
        config,
        _config,
        switchKey: stub(),
    });
    
    t.calledWith(vim, ['Escape', event]);
    t.end();
});

test('cloudcmd: client: key: disable vim', async (t) => {
    const _config = stub();
    const config = stub();
    
    const event = {
        keyCode: ESC,
        key: 'Escape',
        altKey: false,
    };
    
    Key.setBind();
    await _listener(event, {
        config,
        _config,
        switchKey: stub(),
    });
    
    t.calledWith(_config, ['vim', true]);
    t.end();
});

test('cloudcmd: key: Insert: toggles selection of current file', async (t) => {
    const setCurrentFile = stub();
    const toggleSelectedFile = stub().returns({
        setCurrentFile,
    });
    
    const next = {};
    const {DOM} = globalThis;
    
    globalThis.DOM = {
        ...getDOM(),
        CurrentInfo: {
            element: {
                nextSibling: next,
            },
            name: 'a.txt',
            isDir: false,
            panel: {},
            path: '/a.txt',
        },
        toggleSelectedFile,
        setCurrentFile,
    };
    
    await _switchKey({
        keyCode: INSERT,
        preventDefault: noop,
    });
    
    globalThis.DOM = DOM;
    
    t.calledOnce(toggleSelectedFile, 'should toggle selection');
    t.end();
});

test('cloudcmd: key: Insert: moves cursor to next file', async (t) => {
    const next = {};
    const setCurrentFile = stub();
    const {DOM} = globalThis;
    
    globalThis.DOM = {
        ...getDOM(),
        CurrentInfo: {
            element: {
                nextSibling: next,
            },
            name: 'a.txt',
            isDir: false,
            panel: {},
            path: '/a.txt',
        },
        toggleSelectedFile: stub().returns({
            setCurrentFile,
        }),
    };
    
    await _switchKey({
        keyCode: INSERT,
        preventDefault: noop,
    });
    
    globalThis.DOM = DOM;
    
    t.calledWith(setCurrentFile, [next], 'should move cursor to next');
    t.end();
});
