import supermenu from 'supermenu';

const noop = () => {};
const {CloudCmd} = globalThis;

export const createCloudMenu = async (fm, options, menuData) => {
    const createMenu = await loadMenu();
    const menu = await createMenu(fm, options, menuData);
    
    menu.addContextMenuListener = menu.addContextMenuListener || noop;
    
    return menu;
};

async function loadMenu() {
    if (CloudCmd.config('menu') === 'aleman') {
        const {prefix} = CloudCmd;
        const {host, protocol} = globalThis.location;
        const url = `${protocol}//${host}${prefix}/node_modules/aleman/menu/menu.js`;
        const {createMenu} = await import(/* webpackIgnore: true */url);
        
        return createMenu;
    }
    
    return createSupermenu;
}

function createSupermenu(name, options, menuData) {
    const element = document.querySelector('[data-name="js-fm"]');
    return supermenu(element, options, menuData);
}
