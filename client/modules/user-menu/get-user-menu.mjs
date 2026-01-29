export const getUserMenu = (menuFn) => {
    const module = {};
    const fn = Function('module', menuFn);
    
    fn(module);
    
    return module.exports;
};
