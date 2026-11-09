import {
    addFlag,
    getAttribute,
    hasAttribute,
} from '../../jsx.js';

export const report = () => 'Disable the control when the checkbox it depends on is off';
export const include = () => [
    'JSXElement',
];

export const filter = (path, {options}) => {
    if (!hasAttribute(path, 'data-enabled-by'))
        return false;
    
    const name = getAttribute(path, 'data-enabled-by');
    
    return !options.config[name] && !hasAttribute(path, 'disabled');
};

export const fix = (path) => addFlag(path, 'disabled');
