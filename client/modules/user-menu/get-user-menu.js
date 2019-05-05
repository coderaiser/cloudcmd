'use strict';

const defaultUserMenu = {
    'F2 - Rename file': async ({DOM}) => {
        DOM.renameCurrent();
    },
};

module.exports = (menuFn) => {
    if (!menuFn)
        return defaultUserMenu;
    
    const module = {};
    const fn = Function('module', menuFn);
    
    fn(module);
    
    return module.exports;
};

