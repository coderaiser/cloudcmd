import {supermenu} from 'supermenu';
import {createMenu as createAlemanMenu} from 'aleman/menu/bundle';
import {createMenu as createLunesMenu} from 'aleman/lunes/bundle';
import {pickMenu} from './pick-menu.js';

const noop = () => {};
const {CloudCmd} = globalThis;

export const createCloudMenu = async (fm, options, menuData) => {
    const createMenu = pickMenu(CloudCmd.config('menu'), {
        supermenu: createSupermenu,
        aleman: createAlemanMenu,
        lunes: createLunesMenu,
    });
    
    const menu = await createMenu(fm, options, menuData);
    
    menu.addContextMenuListener = menu.addContextMenuListener || noop;
    
    return menu;
};

function createSupermenu(name, options, menuData) {
    const element = document.querySelector('[data-name="js-fm"]');
    return supermenu(element, options, menuData);
}
