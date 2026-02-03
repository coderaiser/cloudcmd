/* global CloudCmd */
/* global DOM */
import vim from './vim.js';
import * as finder from './find.js';
import {
    setCurrent,
    selectFileNotParent,
} from './set-current.js';

export default (key, event, overrides = {}) => {
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
        stopImmediatePropagation = event?.preventDefault?.bind(event),
        promptNewFile = DOM.promptNewFile,
        
        toggleSelectedFile,
        Buffer = {},
        createFindNext = _createFindNext,
        createFindPrevious = _createFindPrevious,
        createMakeFile = _createMakeFile,
    } = deps;
    
    return {
        makeFile: createMakeFile({
            promptNewFile,
            preventDefault,
            stopImmediatePropagation,
        }),
        findNext: createFindNext({
            setCurrentByName,
        }),
        findPrevious: createFindPrevious({
            setCurrentByName,
        }),
        escape: unselectFiles,
        
        remove: () => {
            Operation.show('delete');
        },
        
        makeDirectory: () => {
            event.stopImmediatePropagation();
            event.preventDefault();
            DOM.promptNewDir();
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
    };
};

export const selectFile = selectFileNotParent;

const _createFindPrevious = (overrides = {}) => () => {
    const {setCurrentByName} = overrides;
    const name = finder.findPrevious();
    
    setCurrentByName(name);
};

const _createFindNext = (overrides = {}) => () => {
    const {setCurrentByName} = overrides;
    const name = finder.findNext();
    
    setCurrentByName(name);
};

const _createMakeFile = (overrides = {}) => () => {
    const {
        promptNewFile,
        stopImmediatePropagation,
        preventDefault,
    } = overrides;
    
    stopImmediatePropagation();
    preventDefault();
    promptNewFile();
};
