'use strict';

/* global CloudCmd */
/* global DOM */
const vim = require('./vim');
const finder = require('./find');

const Info = DOM.CurrentInfo;
const {Dialog} = DOM;

module.exports = async (key, event) => {
    const operations = getOperations(event);
    await vim(key, operations);
};

const getOperations = (event) => ({
    escape: DOM.unselectFiles,
    
    remove: () => {
        CloudCmd.Operation.show('delete');
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
        DOM.Buffer.copy();
        DOM.unselectFiles();
    },
    
    select: () => {
        const current = Info.element;
        DOM.toggleSelectedFile(current);
    },
    
    paste: DOM.Buffer.paste,
    
    moveNext: ({count, isVisual, isDelete}) => {
        setCurrent('next', {
            count,
            isVisual,
            isDelete,
        });
    },
    
    movePrevious: ({count, isVisual, isDelete}) => {
        setCurrent('previous', {
            count,
            isVisual,
            isDelete,
        });
    },
    
    find: async () => {
        event.preventDefault();
        const [, value] = await Dialog.prompt('Find', '');
        
        if (!value)
            return;
        
        const names = Info.files.map(DOM.getCurrentName);
        const [result] = finder.find(value, names);
        
        DOM.setCurrentByName(result);
    },
    
    findNext: () => {
        const name = finder.findNext();
        DOM.setCurrentByName(name);
    },
    
    findPrevious: () => {
        const name = finder.findPrevious();
        DOM.setCurrentByName(name);
    },
});

module.exports.selectFile = selectFile;

function selectFile(current) {
    const name = DOM.getCurrentName(current);
    
    if (name === '..')
        return;
    
    DOM.selectFile(current);
}

function setCurrent(sibling, {count, isVisual, isDelete}) {
    let current = Info.element;
    const select = isVisual ? selectFile : DOM.unselectFile;
    
    select(current);
    
    const position = `${sibling}Sibling`;
    
    for (let i = 0; i < count; i++) {
        const next = current[position];
        
        if (!next)
            break;
        
        current = next;
        select(current);
    }
    
    DOM.setCurrentFile(current);
    
    if (isDelete)
        CloudCmd.Operation.show('delete');
}
