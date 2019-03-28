/* global DOM */

'use strict';

const Info = DOM.CurrentInfo;
const {escapeRegExp} = require('../../common/util');

module.exports = function setCurrentByChar(char, charStore) {
    let firstByName;
    let skipCount = 0;
    let setted = false;
    let i = 0;
    
    const escapeChar = escapeRegExp(char);
    const regExp = new RegExp('^' + escapeChar + '.*$', 'i');
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
            setted = true;
            DOM.setCurrentFile(byName);
            return true;
        } else {
            if (skipN === skipCount)
                firstByName = byName;
            
            --skipCount;
        }
    };
    
    names
        .filter(isTest)
        .filter(not(isRoot))
        .some(setCurrent);
    
    if (!setted) {
        DOM.setCurrentFile(firstByName);
        charStore([char]);
    }
};

