'use strict';

const Entities = {
    '&nbsp;': ' ',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
};

const keys = Object.keys(Entities);

module.exports.encode = (str) => {
    keys.forEach((code) => {
        const char = Entities[code];
        const reg = RegExp(char, 'g');
        
        str = str.replace(reg, code);
    });
    
    return str;
};

module.exports.decode = (str) => {
    keys.forEach((code) => {
        const char = Entities[code];
        const reg = RegExp(code, 'g');
        
        str = str.replace(reg, char);
    });
    
    return str;
};

