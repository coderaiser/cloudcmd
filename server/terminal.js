'use strict';

const tryCatch = require('try-catch');
const config = require('./config');

const noop = () => {};
noop.listen = noop;

module.exports = (arg) => {
    return getTerminal(config('terminal'), arg);
};

function getTerminal(term, arg) {
    if (!term)
        return noop;
    
    let result;
    
    const e = tryCatch(() => {
        result = require(config('terminalPath'));
    });
    
    if (!e && !arg)
        return result;
    
    if (!e)
        return result(arg);
    
    config('terminal', false);
    console.log(`cloudcmd --terminal: ${e.message}`);
    
    return noop;
}

