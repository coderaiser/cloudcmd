'use strict';

const fullstore = require('fullstore');
const limier = require('limier');

const searchStore = fullstore([]);
const searchIndex = fullstore(0);

module.exports.find = (value, names) => {
    const result = limier(value, names);
    
    searchStore(result);
    searchIndex(0);
    
    return result;
};

module.exports.findNext = () => {
    const names = searchStore();
    const index = next(searchIndex(), names.length);
    
    searchIndex(index);
    return names[searchIndex()];
};

module.exports.findPrevious = () => {
    const names = searchStore();
    const index = previous(searchIndex(), names.length);
    
    searchIndex(index);
    return names[index];
};

module.exports._next = next;
module.exports._previous = previous;

function next(index, length) {
    if (index === length - 1)
        return 0;

    return ++index;
}

function previous(index, length) {
    if (!index)
        return length - 1;

    return --index;
}
