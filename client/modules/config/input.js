'use strict';

const currify = require('currify/legacy');

const isType = currify((type, object, name) => {
    return typeof object[name] === type;
});

const isBool = isType('boolean');

module.exports.getElementByName = getElementByName;

function getElementByName(selector, element) {
    const str = `[data-name="js-${selector}"]`;
    
    return element
        .querySelector(str);
}

module.exports.getName = (element) => {
    const name = element
        .getAttribute('data-name')
        .replace(/^js-/, '');
    
    return name;
};

module.exports.convert = (config) => {
    const result = {
        ...config,
    };
    const array = Object.keys(config);
    
    const filtered = array.filter(isBool(config));
    
    for (const name of filtered) {
        const item = config[name];
        result[name] = setState(item);
    }
    
    return result;
};

function setState(state) {
    if (state)
        return ' checked';
    
    return '';
}

module.exports.getValue = (name, element) => {
    const el = getElementByName(name, element);
    const {type} = el;
    
    switch(type) {
    case 'checkbox':
        return el.checked;
    
    case 'number':
        return Number(el.value);
    
    default:
        return el.value;
    }
};

module.exports.setValue = (name, value, element) => {
    const el = getElementByName(name, element);
    const {type} = el;
    
    switch(type) {
    case 'checkbox':
        el.checked = value;
        break;
    
    default:
        el.value = value;
        break;
    }
};

