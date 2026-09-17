import {supermenu} from 'supermenu';
import {createMenu as createAlemanMenu} from 'aleman/menu/bundle';

const noop = () => {};
const {CloudCmd} = globalThis;

export const createCloudMenu = async (fm, options, menuData) => {
    const createMenu = CloudCmd.config('menu') === 'aleman' ? createAlemanMenu : createSupermenu;
    const menu = await createMenu(fm, options, menuData);
    
    menu.addContextMenuListener = menu.addContextMenuListener || noop;
    
    return menu;
};

function createSupermenu(name, options, menuData) {
    const element = document.querySelector('[data-name="js-fm"]');
    return supermenu(element, options, menuData);
}
