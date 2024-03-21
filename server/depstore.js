'use strict';

module.exports.createDepStore = () => {
    let deps = {};
    
    return (name, value) => {
        if (!name)
            return deps = {};
        
        if (!value)
            return deps[name];
        
        deps[name] = value;
    };
};
