'use strict';

const {
    J,
    K,
    UP,
    DOWN,
} = require('../../key/key.js');

module.exports = (el, {keyCode}) => {
    if (keyCode === DOWN || keyCode === J)
        return down(el);
    
    if (keyCode === UP || keyCode === K)
        return up(el);
};

function down(el) {
    const {length} = el;
    
    if (el.selectedIndex === length - 1)
        el.selectedIndex = 0;
    else
        ++el.selectedIndex;
}

function up(el) {
    const {length} = el;
    
    if (!el.selectedIndex)
        el.selectedIndex = length - 1;
    else
        --el.selectedIndex;
}

