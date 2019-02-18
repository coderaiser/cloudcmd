'use strict';

/* global DOM */

let SelectType = '*.*';
const TITLE = 'Cloud Commander';

const {getRegExp} = require('../../common/util');

module.exports = (msg, files) => {
    const allMsg = `Specify file type for ${msg} selection`;
    const cancel = false;
    const {Dialog} = DOM;
    
    Dialog.prompt(TITLE, allMsg, SelectType, {cancel}).then((type) => {
        SelectType = type;
        
        const regExp = getRegExp(type);
        
        if (!files)
            return;
        
        let matches = 0;
        
        files.forEach((current) => {
            const name = DOM.getCurrentName(current);
            
            if (name === '..')
                return;
            
            const isMatch = regExp.test(name);
            
            if (!isMatch)
                return;
            
            ++matches;
            
            let isSelected = DOM.isSelected(current);
            const shouldSel = msg === 'expand';
            
            if (shouldSel)
                isSelected = !isSelected;
            
            if (isSelected)
                DOM.toggleSelectedFile(current);
        });
        
        if (!matches)
            Dialog.alert('Select Files', 'No matches found!');
    });
};

