'use strict';

const {
    table,
    getBorderCharacters,
} = require('table');

module.exports = (config) => {
    check(config);
    
    const data = Object.keys(config).map((name) => {
        return [name, config[name]];
    });
    
    if (!data.length)
        return '';
    
    return table(data, {
        columns: {
            1: {
                width: 30,
                truncate: 30,
            },
        },
        border: getBorderCharacters('ramac'),
    });
};

function check(config) {
    if (!config)
        throw Error('config could not be empty!');
    
    if (typeof config !== 'object')
        throw Error('config should be an object!');
}

