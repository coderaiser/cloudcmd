'use strict';

const path = require('path');
const flop = require('flop');
const check = require('checkup');
const promisify = require('es6-promisify').promisify;

const move = promisify(flop.move);

module.exports = (files, callback) => {
    if (!files.names)
        return move(files.from, files.to)
            .then(callback)
            .catch(callback);
    
    const names = files.names.slice();
    const copy = () => {
        const isLast = !names.length;
        
        if (isLast)
            return callback(null);
        
        const name = names.shift();
        const from = path.join(files.from, name);
        const to = path.join(files.to, name);
        
        move(from, to)
            .then(copy)
            .catch(callback);
    };
    
    check
        .type('callback', callback, 'function')
        .check({
            files,
        });
    
    copy();
};

