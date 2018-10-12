'use strict';

const getMessage = (a) => a && a.message || a;

module.exports= (...args) => {
    const messages = args.map(getMessage);
    
    console.error(...messages);
    process.exit(1);
};

