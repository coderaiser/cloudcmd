'use strict';

const tryCatch = require('try-catch');
const config = require('./config');

const noop = () => {};
noop.listen = noop;

module.exports = getTerminal(config('terminal'));

function getTerminal(term) {
    if (!term)
        return noop;
    
    let result;
    
    const e = tryCatch(() => {
        result = require(config('terminalPath'));
    });
    
    if (!e)
        return result;
    
    config('terminal', false);
    console.log(`cloudcmd --terminal: ${e.message}`);
    
    return noop;
}

