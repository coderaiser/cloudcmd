const isString = (a) => typeof a === 'string';

export default (value) => {
    if (!isString(value))
        return '';
    
    if (value.length === 1)
        return '';
    
    if (value && !value.includes('/'))
        return `/${value}`;
    
    return value;
};
