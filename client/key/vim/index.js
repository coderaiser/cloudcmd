'use strict';

/* global CloudCmd */
/* global DOM */
const vim = require('./vim');
const finder = require('./find');
const {
    setCurrent,
    selectFileNotParent,
} = require('./set-current');

module.exports = (key, event, overrides = {}) => {
    const defaults = {
        ...globalThis.DOM,
        ...globalThis.CloudCmd,
    };
    
    const deps = {
        ...defaults,
        ...overrides,
    };
    
    const operations = getOperations(event, deps);
    
    vim(key, operations, deps);
};

const getOperations = (event, deps) => {
    const {
        Info = globalThis.DOM.CurrentInfo,
        CloudCmd = globalThis.CloudCmd,
        Operation,
        unselectFiles,
        setCurrentFile,
        setCurrentByName,
        getCurrentName,
        prompt = globalThis.DOM.Dialog.prompt,
        preventDefault = event?.preventDefault?.bind(event),
        
        toggleSelectedFile,
        Buffer = {},
    } = deps;
    
    return {
        escape: unselectFiles,
        
        remove: () => {
            Operation.show('delete');
        },
        
        makeDirectory: () => {
            event.stopImmediatePropagation();
            event.preventDefault();
            DOM.promptNewDir();
        },
        
        makeFile: () => {
            event.stopImmediatePropagation();
            event.preventDefault();
            DOM.promptNewFile();
        },
        
        terminal: () => {
            CloudCmd.Terminal.show();
        },
        
        edit: () => {
            CloudCmd.EditFileVim.show();
        },
        
        copy: () => {
            Buffer.copy();
            unselectFiles();
        },
        
        select: () => {
            const current = Info.element;
            toggleSelectedFile(current);
        },
        
        paste: Buffer.paste,
        
        moveNext: ({count, isVisual, isDelete}) => {
            setCurrent('next', {
                count,
                isVisual,
                isDelete,
            }, {
                Info,
                setCurrentFile,
                unselectFiles,
                Operation,
            });
        },
        
        movePrevious: ({count, isVisual, isDelete}) => {
            setCurrent('previous', {
                count,
                isVisual,
                isDelete,
            }, {
                Info,
                setCurrentFile,
                unselectFiles,
                Operation,
            });
        },
        
        find: async () => {
            preventDefault();
            const [, value] = await prompt('Find', '');
            
            if (!value)
                return;
            
            const names = Info.files.map(getCurrentName);
            const [result] = finder.find(value, names);
            
            setCurrentByName(result);
        },
        
        findNext: () => {
            const name = finder.findNext();
            setCurrentByName(name);
        },
        
        findPrevious: () => {
            const name = finder.findPrevious();
            setCurrentByName(name);
        },
    };
};

module.exports.selectFile = selectFileNotParent;
