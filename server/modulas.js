'use strict';

const deepmerge = require('deepmerge');
const originalModules = require('../json/modules');

module.exports = (modules) => {
    const result = deepmerge(originalModules, modules || {});
    
    return (req, res, next) => {
        if (req.url !== '/json/modules.json')
            return next();
        
        res.send(result);
    };
};

