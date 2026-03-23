import {encode} from '#common/entity';

const isBool = (a) => typeof a === 'boolean';
const isString = (a) => typeof a === 'string';

const {keys} = Object;

export function getElementByName(selector, element) {
    const str = `[data-name="js-${selector}"]`;
    
    return element.querySelector(str);
}

export const getName = (element) => {
    const name = element
        .getAttribute('data-name')
        .replace(/^js-/, '');
    
    return name;
};

export const convert = (config) => {
    const result = config;
    
    for (const name of keys(config)) {
        const item = config[name];
        
        if (isBool(item)) {
            result[name] = setState(item);
            continue;
        }
        
        if (isString(item)) {
            result[name] = encode(item);
            continue;
        }
    }
    
    return result;
};

function setState(state) {
    if (state)
        return ' checked';
    
    return '';
}

export const getValue = (name, element) => {
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

export const setValue = (name, value, element) => {
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
