'use strict';

const defaultUserMenu = require('./default-menu.js');

module.exports = (menuFn) => {
    if (!menuFn)
        return defaultUserMenu;
    
    const module = {};
    const fn = Function('module', menuFn);
    
    fn(module);
    
    return module.exports;
};

