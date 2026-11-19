import {types} from 'putout';
import currify from 'currify';
import {has, toMarkup} from '../../value.js';

const {
    isStringLiteral,
    stringLiteral,
} = types;

const PLACEHOLDER = /\{([\w-]+)\}/g;

const isKnown = currify((data, [, name]) => has(data, name));
const hasKnown = (text, data) => [...text.matchAll(PLACEHOLDER)].some(isKnown(data));
const replace = currify((data, match, name) => has(data, name) ? toMarkup(data[name]) : match);

export const report = () => 'Put the data into the value of the attribute';

export const include = () => [
    'JSXAttribute',
];

export const filter = ({node}, {options}) => {
    if (!isStringLiteral(node.value))
        return false;
    
    return hasKnown(node.value.value, options.data);
};

export const fix = ({node}, {options}) => {
    const value = node.value.value.replace(PLACEHOLDER, replace(options.data));
    
    node.value = stringLiteral(value);
};
