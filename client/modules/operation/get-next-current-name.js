'use strict';

const currify = require('currify');

const not = currify((array, value) => !array.includes(value));
const notOneOf = currify((a, b) => a.filter(not(b)));

module.exports = (currentName, names, removedNames) => {
    const i = names.indexOf(currentName);
    
    const nextNames = notOneOf(names, removedNames);
    const {length} = nextNames;
    
    if (nextNames[i])
        return nextNames[i];
    
    return nextNames[length - 1];
};

