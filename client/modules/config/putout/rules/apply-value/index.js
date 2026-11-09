import {
    escape,
    getAttribute,
    getName,
    setAttribute,
    toOptionName,
} from '../../jsx.js';

const isUndefined = (a) => typeof a === 'undefined';

export const report = () => 'Set the value of the input from the option';
export const include = () => [
    'JSXElement',
];

const isEmpty = (a) => isUndefined(a) || a === null;
const toText = (a) => isEmpty(a) ? '' : String(a);
const isInput = (path) => getName(path) === 'input' && getAttribute(path, 'type') !== 'checkbox';

const getText = (path, {config}) => {
    const name = toOptionName(getAttribute(path, 'data-name'));
    
    return toText(config[name]);
};

export const filter = (path, {options}) => {
    if (!isInput(path))
        return false;
    
    return getAttribute(path, 'value') !== escape(getText(path, options));
};

export const fix = (path, {options}) => setAttribute(path, 'value', getText(path, options));
