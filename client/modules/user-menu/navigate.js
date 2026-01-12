'use strict';

const {fullstore} = require('fullstore');

const {
    J,
    K,
    UP,
    DOWN,
} = require('../../key/key.js');

const store = fullstore(1);
const isDigit = (a) => /^\d+$/.test(a);

module.exports = (el, {key, keyCode}) => {
    if (isDigit(key))
        store(Number(key));
    
    if (keyCode === DOWN || keyCode === J) {
        const count = store();
        store(1);
        
        return down(el, count);
    }
    
    if (keyCode === UP || keyCode === K) {
        const count = store();
        store(1);
        
        return up(el, count);
    }
};

function down(el, count) {
    const {length} = el;
    
    if (el.selectedIndex === length - 1)
        el.selectedIndex = 0;
    else
        el.selectedIndex += count;
    
    if (el.selectedIndex < 0)
        el.selectedIndex = length - 1;
}

function up(el, count) {
    const {length} = el;
    
    if (!el.selectedIndex)
        el.selectedIndex = length - 1;
    else
        el.selectedIndex -= count;
    
    if (el.selectedIndex < 0)
        el.selectedIndex = 0;
}
