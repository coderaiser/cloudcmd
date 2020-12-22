import tryCatch from 'try-catch';

import exit from './exit.js';
import columnsData from './columns.js';

export const root = async (dir, config) => {
    if (typeof dir !== 'string')
        throw Error('dir should be a string');
    
    if (dir === '/')
        return;
    
    if (config('dropbox'))
        return;
    
    const {statSync} = await import('fs');
    const [error] = tryCatch(statSync, dir);
    
    if (error)
        return exit('cloudcmd --root: %s', error.message);
};

export const editor = (name) => {
    const reg = /^(dword|edward|deepword)$/;
    
    if (!reg.test(name))
        exit('cloudcmd --editor: could be "dword", "edward" or "deepword" only');
};

export const packer = (name) => {
    const reg = /^(tar|zip)$/;
    
    if (!reg.test(name))
        exit('cloudcmd --packer: could be "tar" or "zip" only');
};

export const columns = (type) => {
    const addQuotes = (a) => `"${a}"`;
    const all = Object
        .keys(columnsData)
        .concat('');
    
    const names = all
        .filter(Boolean)
        .map(addQuotes)
        .join(', ');
    
    if (!all.includes(type))
        exit(`cloudcmd --columns: can be only one of: ${names}`);
};

