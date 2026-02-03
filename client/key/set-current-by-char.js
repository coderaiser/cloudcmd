/* global DOM */
import {escapeRegExp} from '#common/util';

export default function setCurrentByChar(char, charStore) {
    const Info = DOM.CurrentInfo;
    let firstByName;
    let skipCount = 0;
    let set = false;
    let i = 0;
    
    const escapeChar = escapeRegExp(char);
    const regExp = new RegExp(`^${escapeChar}.*$`, 'i');
    const {files} = Info;
    const chars = charStore();
    const n = chars.length;
    
    while (i < n && char === chars[i])
        i++;
    
    if (!i)
        charStore([]);
    
    const skipN = skipCount = i;
    
    charStore(charStore().concat(char));
    
    const names = DOM.getFilenames(files);
    const isTest = (a) => regExp.test(a);
    const isRoot = (a) => a === '..';
    const not = (f) => (a) => !f(a);
    
    const setCurrent = (name) => {
        const byName = DOM.getCurrentByName(name);
        
        if (!skipCount) {
            set = true;
            DOM.setCurrentFile(byName);
            
            return true;
        }
        
        if (skipN === skipCount)
            firstByName = byName;
        
        --skipCount;
    };
    
    names
        .filter(isTest)
        .filter(not(isRoot))
        .some(setCurrent);
    
    if (!set) {
        DOM.setCurrentFile(firstByName);
        charStore([char]);
    }
}
