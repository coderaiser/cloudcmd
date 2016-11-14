'use strict';

module.exports = currify;

let tail = list => [].slice.call(list, 1);

function currify(fn) {
    check(fn);
    
    let args = tail(arguments);
    
    if (args.length >= fn.length)
        return fn(...args);
    else
        return function() {
            return currify(...[fn, ...args, ...arguments]);
        };
}

function check(fn) {
    if (typeof fn !== 'function')
        throw Error('fn should be function!');
}
