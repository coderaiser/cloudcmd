import currify from 'currify';

const isType = currify((type, object, name) => type === typeof object[name]);
const isBool = isType('boolean');

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
