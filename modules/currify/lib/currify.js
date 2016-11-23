'use strict';

const tail = list => [].slice.call(list, 1);
const f = (fn) => [
    function(a) {
        return fn(...arguments);
    },
    function(a, b) {
        return fn(...arguments);
    },
    function(a, b, c) {
        return fn(...arguments);
    },
    function(a, b, c, d) {
        return fn(...arguments);
    },
    function(a, b, c, d, e) {
        return fn(...arguments);
    }
];

module.exports = function currify(fn) {
    check(fn);
    
    const args = tail(arguments);
    
    if (args.length >= fn.length)
        return fn(...args);
    
    const again = function() {
        return currify(...[fn, ...args, ...arguments]);
    };
    
    const count = fn.length - arguments.length;
    const func = f(again)[count];
    
    return func || again;
}

function check(fn) {
    if (typeof fn !== 'function')
        throw Error('fn should be function!');
}

