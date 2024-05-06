import {statSync as _statSync} from 'node:fs';
import tryCatch from 'try-catch';
import _exit from './exit.js';
import {getColumns as _getColumns} from './columns.mjs';
import {getThemes as _getThemes} from './theme.mjs';

const isString = (a) => typeof a === 'string';

export const root = (dir, config, overrides = {}) => {
    const {
        exit = _exit,
        statSync = _statSync,
    } = overrides;
    
    if (!isString(dir))
        throw Error('dir should be a string');
    
    if (dir === '/')
        return;
    
    if (config('dropbox'))
        return;
    
    const [error] = tryCatch(statSync, dir);
    
    if (error)
        return exit('cloudcmd --root: %s', error.message);
};

export const editor = (name, {exit = _exit} = {}) => {
    const reg = /^(dword|edward|deepword)$/;
    
    if (!reg.test(name))
        exit('cloudcmd --editor: could be "dword", "edward" or "deepword" only');
};

export const packer = (name, {exit = _exit} = {}) => {
    const reg = /^(tar|zip)$/;
    
    if (!reg.test(name))
        exit('cloudcmd --packer: could be "tar" or "zip" only');
};

export const columns = (type, overrides = {}) => {
    const {
        exit = _exit,
        getColumns = _getColumns,
    } = overrides;
    const addQuotes = (a) => `"${a}"`;
    const all = Object
        .keys(getColumns())
        .concat('');
    
    const names = all
        .filter(Boolean)
        .map(addQuotes)
        .join(', ');
    
    if (!all.includes(type))
        exit(`cloudcmd --columns: can be only one of: ${names}`);
};

export const theme = (type, overrides = {}) => {
    const {
        exit = _exit,
        getThemes = _getThemes,
    } = overrides;
    const addQuotes = (a) => `"${a}"`;
    const all = Object
        .keys(getThemes())
        .concat('');
    
    const names = all
        .filter(Boolean)
        .map(addQuotes)
        .join(', ');
    
    if (!all.includes(type))
        exit(`cloudcmd --theme: can be only one of: ${names}`);
};
