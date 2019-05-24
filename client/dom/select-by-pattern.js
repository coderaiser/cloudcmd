'use strict';

let SelectType = '*.*';

const {getRegExp} = require('../../common/util');
const {
    alert,
    prompt,
} = require('./dialog');

const DOM = require('.');

module.exports = async (msg, files) => {
    if (!files)
        return;
    
    const allMsg = `Specify file type for ${msg} selection`;
    
    /* eslint require-atomic-updates: 0 */
    const [cancel, type] = await prompt(allMsg, SelectType);
    
    if (cancel)
        return;
    
    SelectType = type;
    
    const regExp = getRegExp(type);
    let matches = 0;
    
    for (const current of files) {
        const name = DOM.getCurrentName(current);
        
        if (name === '..' || !regExp.test(name))
            continue;
        
        ++matches;
        
        let isSelected = DOM.isSelected(current);
        const shouldSel = msg === 'expand';
        
        if (shouldSel)
            isSelected = !isSelected;
        
        if (isSelected)
            DOM.toggleSelectedFile(current);
    }
    
    if (!matches)
        alert('No matches found!');
};

