import {alert, prompt} from '#dom/dialog';
import {getRegExp} from '#common/util';
import {getCurrentName} from './current-file.mjs';
import {
    isSelected,
    toggleSelectedFile,
} from './cmd.mjs';

let SelectType = '*.*';

export const selectByPattern = async (msg, files) => {
    if (!files)
        return;
    
    const allMsg = `Specify file type for ${msg} selection`;
    const [cancel, type] = await prompt(allMsg, SelectType);
    
    if (cancel)
        return;
    
    SelectType = type;
    
    const regExp = getRegExp(type);
    let matches = 0;
    
    for (const current of files) {
        const name = getCurrentName(current);
        
        if (name === '..' || !regExp.test(name))
            continue;
        
        ++matches;
        
        let selected = isSelected(current);
        const shouldSel = msg === 'expand';
        
        if (shouldSel)
            selected = !selected;
        
        if (selected)
            toggleSelectedFile(current);
    }
    
    if (!matches)
        alert('No matches found!');
};
