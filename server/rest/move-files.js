'use strict';

const path = require('path');
const flop = require('flop');
const promisify = require('es6-promisify').promisify;

const move = promisify(flop.move);

module.exports = (files, callback) => {
    check(files, callback);
    
    if (!files.names)
        return move(files.from, files.to)
            .then(callback)
            .catch(callback);
    
    const names = files.names.slice();
    const iterate = () => {
        const isLast = !names.length;
        
        if (isLast)
            return callback();
        
        const name = names.shift();
        const from = path.join(files.from, name);
        const to = path.join(files.to, name);
        
        move(from, to)
            .then(iterate)
            .catch(callback);
    };
    
    iterate();
};

function check(files, callback) {
    if (typeof files !== 'object')
        throw Error('files should be an object!');
    
    if (typeof callback !== 'function')
        throw Error('callback should be a function!');
}

