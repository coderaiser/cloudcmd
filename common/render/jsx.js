import {types, operator} from 'putout';
import {encodeMarkup} from './encode-markup.js';

const {
    jsxAttribute,
    jsxIdentifier,
    stringLiteral,
} = types;

const {
    getAttributeNode,
    setAttributeValue,
} = operator;

const isText = ({type}) => type === 'JSXText';
const trim = ({value}) => value.trim();
const isNotName = (name) => ({name: a}) => a.name !== name;

export const escape = encodeMarkup;

export const getName = ({node}) => node.openingElement.name.name;
export const hasAttribute = (path, name) => Boolean(getAttributeNode(path, name));
export const toOptionName = (name) => name.replace(/^js-/, '');

export const getAttribute = (path, name) => {
    const attribute = getAttributeNode(path, name);
    
    if (!attribute)
        return '';
    
    return attribute.value.value;
};

export const setAttribute = (path, name, value) => {
    const escaped = escape(value);
    
    if (hasAttribute(path, name))
        return setAttributeValue(path, name, escaped);
    
    const attribute = jsxAttribute(jsxIdentifier(name), stringLiteral(escaped));
    
    path.node.openingElement.attributes.push(attribute);
};

export const addFlag = (path, name) => {
    const attribute = jsxAttribute(jsxIdentifier(name));
    
    path.node.openingElement.attributes.push(attribute);
};

export const removeAttribute = ({node}, name) => {
    const {openingElement} = node;
    
    openingElement.attributes = openingElement.attributes.filter(isNotName(name));
};

export const getText = ({node}) => node.children
    .filter(isText)
    .map(trim)
    .join('');
