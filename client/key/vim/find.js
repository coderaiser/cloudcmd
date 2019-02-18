'use strict';

/* global DOM */

const fullstore = require('fullstore/legacy');
const limier = require('limier/legacy');
const Info = DOM.CurrentInfo;

const searchStore = fullstore([]);
const searchIndex = fullstore(0);

module.exports.find = (value) => {
    const names = Info.files.map(DOM.getCurrentName);
    const result = limier(value, names);
    
    searchStore(result);
    searchIndex(0);
    
    DOM.setCurrentByName(result[0]);
};

module.exports.findNext = () => {
    const names = searchStore();
    const index = next(searchIndex(), names.length);
    
    searchIndex(index);
    DOM.setCurrentByName(names[searchIndex()]);
};

module.exports.findPrevious = () => {
    const names = searchStore();
    const index = previous(searchIndex(), names.length);
    
    searchIndex(index);
    DOM.setCurrentByName(names[index]);
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

