const ATTRIBUTE = /([\w-]+)(?:=("[^"]*"|[^\s"'>/]+))?/g;
const TAG = /<(\w+)([^>]*)>/g;

const isDefaultType = (a) => a === 'type="text"';
const isNotDefaultType = (a) => !isDefaultType(a);
const quote = (value) => value.startsWith('"') ? value : `"${value}"`;
const getAttribute = ([, name, value]) => value ? `${name.toLowerCase()}=${quote(value)}` : name.toLowerCase();
const addSpace = (a) => ` ${a}`;

const sortAttributes = (attributes) => {
    const list = Array
        .from(attributes.matchAll(ATTRIBUTE), getAttribute)
        .filter(isNotDefaultType)
        .sort();
    
    return list
        .map(addSpace)
        .join('');
};

const replaceTag = (all, name, attributes) => `<${name}${sortAttributes(attributes)}>`;

export const normalize = (html) => html
    .replace(/\s+/g, ' ')
    .replace(TAG, replaceTag)
    .replace(/>\s+/g, '>')
    .replace(/\s+</g, '<')
    .replace(/&lcub;/g, '{')
    .replace(/&rcub;/g, '}');
