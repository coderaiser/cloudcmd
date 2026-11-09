import {
    addFlag,
    getAttribute,
    hasAttribute,
    removeAttribute,
} from '../../jsx.js';

export const report = () => 'Hide the item when its option is off';
export const include = () => [
    'JSXElement',
];

export const filter = (path) => hasAttribute(path, 'data-visible-by');

export const fix = (path, {options}) => {
    const name = getAttribute(path, 'data-visible-by');
    
    if (!options.config[name])
        addFlag(path, 'hidden');
    
    removeAttribute(path, 'data-visible-by');
};
