const {entries, assign} = Object;

export const parseUserMenu = (userMenu) => {
    const names = [];
    const keys = {};
    const items = {};
    const settings = {};
    
    for (const [str, fn] of entries(userMenu)) {
        if (str === '__settings') {
            assign(settings, userMenu[str]);
            continue;
        }
        
        if (str.startsWith('_'))
            continue;
        
        names.push(str);
        const [key, name] = str.split(' - ');
        
        keys[key] = fn;
        items[name] = fn;
    }
    
    return {
        names,
        keys,
        items,
        settings,
    };
};
