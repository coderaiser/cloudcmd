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
    
    const result = tryCatch(require, config('terminalPath'));
    const e = result[0];
    const terminalModule = result[1];
    
    if (!e && !arg)
        return terminalModule;
    
    if (!e)
        return terminalModule(arg);
    
    config('terminal', false);
    console.log(`cloudcmd --terminal: ${e.message}`);
    
    return noop;
}

