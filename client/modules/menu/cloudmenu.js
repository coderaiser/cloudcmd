import {supermenu} from 'supermenu';

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
        const {createMenu} = await import(
            /* webpackChunkName: 'aleman' */
            'aleman/menu',
        );
        
        return createMenu;
    }
    
    return createSupermenu;
}

function createSupermenu(name, options, menuData) {
    const element = document.querySelector('[data-name="js-fm"]');
    
    return supermenu(element, options, menuData);
}
