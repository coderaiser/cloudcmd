import {
    addFlag,
    getAttribute,
    getName,
    getText,
    hasAttribute,
    toOptionName,
} from '../../jsx.js';

export const report = () => 'Select the option that is the value of the option of the config';
export const include = () => [
    'JSXElement',
];

export const filter = (path, {options}) => {
    if (getName(path) !== 'option')
        return false;
    
    const name = toOptionName(getAttribute(path.parentPath, 'data-name'));
    
    return options.config[name] === getText(path) && !hasAttribute(path, 'selected');
};

export const fix = (path) => addFlag(path, 'selected');
