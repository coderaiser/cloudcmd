import {test} from 'supertape';
import {pickMenu} from './pick-menu.js';

const supermenu = () => 'supermenu';
const aleman = () => 'aleman';
const lunes = () => 'lunes';

const menus = {
    supermenu,
    aleman,
    lunes,
};

test('cloudcmd: client: menu: pickMenu: aleman', (t) => {
    const result = pickMenu('aleman', menus);
    
    t.equal(result, aleman);
    t.end();
});

test('cloudcmd: client: menu: pickMenu: lunes', (t) => {
    const result = pickMenu('lunes', menus);
    
    t.equal(result, lunes);
    t.end();
});

test('cloudcmd: client: menu: pickMenu: supermenu', (t) => {
    const result = pickMenu('supermenu', menus);
    
    t.equal(result, supermenu);
    t.end();
});

test('cloudcmd: client: menu: pickMenu: unknown name falls back to supermenu', (t) => {
    const result = pickMenu('hello', menus);
    
    t.equal(result, supermenu);
    t.end();
});
