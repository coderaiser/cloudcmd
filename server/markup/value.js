import {escape} from '#common/render/jsx';

const BACKSLASH = '\\';
const CLASS_NAME = 'className';
const IN_MARKUP = 'className&#101;';
const IN_SCRIPT = `className${BACKSLASH}u0065`;

export const has = (data, name) => Object.hasOwn(data, name);

export const toMarkup = (value) => escape(value).replaceAll(CLASS_NAME, IN_MARKUP);

export const toContent = (name, {data, raw}, inScript) => {
    const value = raw.includes(name) ? data[name] : escape(data[name]);
    
    return value.replaceAll(CLASS_NAME, inScript ? IN_SCRIPT : IN_MARKUP);
};
