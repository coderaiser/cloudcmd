import {test, stub} from 'supertape';
import renameCurrent from './rename-current.js';

test('cloudcmd: client: dom: renameCurrent: isCurrentFile', async (t) => {
    const current = {};
    const isCurrentFile = stub();
    
    const currentFile = stubCurrentFile({
        isCurrentFile,
    });
    
    await renameCurrent(current, {
        Dialog: stubDialog(),
        currentFile,
    });
    
    t.calledWith(isCurrentFile, [current], 'should call isCurrentFile');
    t.end();
});

test('cloudcmd: client: dom: renameCurrent: file exist', async (t) => {
    const current = {};
    const name = 'hello';
    
    const prompt = stub().returns([null, name]);
    const confirm = stub().returns([true]);
    
    const getCurrentByName = stub().returns(current);
    const getCurrentType = stub().returns('directory');
    
    const Dialog = stubDialog({
        confirm,
        prompt,
    });
    
    const currentFile = stubCurrentFile({
        getCurrentByName,
        getCurrentType,
    });
    
    await renameCurrent(null, {
        Dialog,
        currentFile,
    });
    
    const expected = 'Directory "hello" already exists. Proceed?';
    
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
