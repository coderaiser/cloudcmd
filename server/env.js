'use strict';

const snake = require('just-snake-case');

const {env} = process;
const up = (a) => a.toUpperCase();

module.exports = parse;
module.exports.bool = (name) => {
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

function parse(name) {
    const small = `cloudcmd_${snake(name)}`;
    const big = up(small);
    
    return env[big] || env[small];
}

