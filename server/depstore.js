'use strict';

module.exports.createDepStore = () => {
    const deps = {};
    
    return (name, value) => {
        if (!name)
            return false;
        
        if (!value)
            return deps[name];
        
        deps[name] = value;
    };
};
