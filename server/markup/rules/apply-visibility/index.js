import {operator} from 'putout';
import {
    getAttribute,
    hasAttribute,
    removeAttribute,
} from '#common/render/jsx';

const {addClassName} = operator;

export const report = () => 'Hide the element when its option is off';

export const include = () => [
    'JSXElement',
];

export const filter = (path) => {
    if (!hasAttribute(path, 'data-visible-by'))
        return false;
    
    return Boolean(getAttribute(path, 'data-visible-by'));
};

export const fix = (path, {options}) => {
    const by = getAttribute(path, 'data-visible-by');
    const className = getAttribute(path, 'data-hide-with') || 'none';
    const inverted = by.startsWith('!');
    const name = by.replace(/^!/, '');
    const isVisible = Boolean(options.config[name]) !== inverted;
    
    removeAttribute(path, 'data-visible-by');
    removeAttribute(path, 'data-hide-with');
    
    if (!isVisible)
        addClassName(path, className);
};
