import {types} from 'putout';
import {has, toContent} from '../../value.js';

const {jsxText} = types;

const getName = ({node}) => node.expression.name;
const isScript = ({parentPath}) => parentPath.node.openingElement.name.name === 'script';
const isIdentifier = ({node}) => node.expression.type === 'Identifier';

export const report = () => 'Put the data into the content of the element';

export const include = () => [
    'JSXExpressionContainer',
];

export const filter = (path, {options}) => {
    if (!path.parentPath.isJSXElement())
        return false;
    
    return isIdentifier(path) && has(options.data, getName(path));
};

export const fix = (path, {options}) => {
    const content = toContent(getName(path), options, isScript(path));
    
    path.replaceWith(jsxText(content));
};
