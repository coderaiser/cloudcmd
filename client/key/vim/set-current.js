'use strict';

/* global DOM */
module.exports.selectFileNotParent = selectFileNotParent;
function selectFileNotParent(current, {getCurrentName, selectFile} = DOM) {
    const name = getCurrentName(current);
    
    if (name === '..')
        return;
    
    selectFile(current);
}

module.exports.setCurrent = (sibling, {count, isVisual, isDelete}, {Info, setCurrentFile, unselectFiles, Operation}) => {
    let current = Info.element;
    const select = isVisual ? selectFileNotParent : unselectFiles;
    
    select(current);
    
    const position = `${sibling}Sibling`;
    
    for (let i = 0; i < count; i++) {
        const next = current[position];
        
        if (!next)
            break;
        
        current = next;
        select(current);
    }
    
    setCurrentFile(current);
    
    if (isDelete)
        Operation.show('delete');
};
