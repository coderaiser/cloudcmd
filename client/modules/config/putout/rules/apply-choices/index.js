import {types} from 'putout';
import {
    getAttribute,
    getName,
    getText,
    toOptionName,
} from '../../jsx.js';

const {
    jsxClosingElement,
    jsxElement,
    jsxIdentifier,
    jsxOpeningElement,
    jsxText,
} = types;

export const report = () => 'Take the options of the select from the list of choices';
export const include = () => [
    'JSXElement',
];

const isOption = ({type, openingElement}) => type === 'JSXElement' && openingElement.name.name === 'option';
const toText = (node) => getText({node});
const getChoices = (path, {options}) => options.choices[toOptionName(getAttribute(path, 'data-name'))];

const getCurrent = ({node}) => node.children
    .filter(isOption)
    .map(toText);

const createOption = (value) => jsxElement(
    jsxOpeningElement(jsxIdentifier('option'), []),
    jsxClosingElement(jsxIdentifier('option')),
    [jsxText(value)],
);

export const filter = (path, {options}) => {
    if (getName(path) !== 'select')
        return false;
    
    const choices = getChoices(path, {
        options,
    });
    
    if (!choices)
        return false;
    
    return getCurrent(path).join() !== choices.join();
};

export const fix = (path, {options}) => {
    const choices = getChoices(path, {
        options,
    });
    
    path.node.children = choices.map(createOption);
};
