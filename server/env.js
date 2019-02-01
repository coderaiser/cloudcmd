'use strict';

const {env} = process;
const up = (a) => a.toUpperCase();

module.exports = parse;
module.exports.bool = (name) => {
    const value = parse(name);
    
    if (value === 'true')
        return true;
    
    if (value === 'false')
        return false;
};

function parse(name) {
    const small = `cloudcmd_${name}`;
    const big = up(small);
    
    return env[small] || env[big];
}

