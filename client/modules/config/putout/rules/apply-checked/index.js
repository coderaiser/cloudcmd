import {
    addFlag,
    getAttribute,
    getName,
    hasAttribute,
    toOptionName,
} from '../../jsx.js';

export const report = () => 'Check the checkbox of an option that is on';
export const include = () => [
    'JSXElement',
];

const isCheckbox = (path) => getName(path) === 'input' && getAttribute(path, 'type') === 'checkbox';

export const filter = (path, {options}) => {
    if (!isCheckbox(path))
        return false;
    
    const name = toOptionName(getAttribute(path, 'data-name'));
    
    return options.config[name] && !hasAttribute(path, 'checked');
};

export const fix = (path) => addFlag(path, 'checked');
