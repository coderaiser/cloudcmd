import {env} from 'node:process';
import snake from 'just-snake-case';

const up = (a) => a.toUpperCase();

export const bool = (name) => {
    const value = parse(name);
    
    if (value === 'true')
        return true;
    
    if (value === '1')
        return true;
    
    if (value === 'false')
        return false;
    
    if (value === '0')
        return false;
};

export const parse = (name) => {
    const small = `cloudcmd_${snake(name)}`;
    const big = up(small);
    
    return env[big] || env[small];
};
