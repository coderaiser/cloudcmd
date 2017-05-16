'use strict';

module.exports = () => {
    const data = {};
    
    return (value) => {
        if (typeof value !== 'undefined')
            data.value = value;
        
        return data.value;
    };
};

