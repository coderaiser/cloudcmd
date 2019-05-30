'use strict';

const tryCatch = require('try-catch');

const noop = (req, res, next) => {
    next && next();
};

noop.listen = noop;

module.exports = (config, arg) => {
    if (!config('terminal'))
        return noop;
    
    const [e, terminalModule] = tryCatch(require, config('terminalPath'));
    
    if (!e && !arg)
        return terminalModule;
    
    if (!e)
        return terminalModule(arg);
    
    config('terminal', false);
    console.log(`cloudcmd --terminal: ${e.message}`);
    
    return noop;
};

