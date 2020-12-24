import test from 'supertape';
import navigate from './navigate.js';

import {UP, DOWN, J, K} from '../../key/key.js';

test('cloudcmd: user-menu: navigate: DOWN', (t) => {
    const el = {
        length: 3,
        selectedIndex: 0,
    };
    
    navigate(el, {
        keyCode: DOWN,
    });
    
    t.equal(el.selectedIndex, 1);
    t.end();
});

test('cloudcmd: user-menu: navigate: J', (t) => {
    const el = {
        length: 3,
        selectedIndex: 0,
    };
    
    navigate(el, {
        keyCode: J,
    });
    
    t.equal(el.selectedIndex, 1);
    t.end();
});

test('cloudcmd: user-menu: navigate: DOWN: bottom', (t) => {
    const el = {
        length: 3,
        selectedIndex: 2,
    };
    
    navigate(el, {
        keyCode: DOWN,
    });
    
    t.equal(el.selectedIndex, 0);
    t.end();
});

test('cloudcmd: user-menu: navigate: K', (t) => {
    const el = {
        length: 3,
        selectedIndex: 2,
    };
    
    navigate(el, {
        keyCode: K,
    });
    
    t.equal(el.selectedIndex, 1);
    t.end();
});

test('cloudcmd: user-menu: navigate: UP', (t) => {
    const el = {
        length: 3,
        selectedIndex: 2,
    };
    
    navigate(el, {
        keyCode: UP,
    });
    
    t.equal(el.selectedIndex, 1);
    t.end();
});

test('cloudcmd: user-menu: navigate: UP: top', (t) => {
    const el = {
        length: 3,
        selectedIndex: 0,
    };
    
    navigate(el, {
        keyCode: UP,
    });
    
    t.equal(el.selectedIndex, 2);
    t.end();
});

test('cloudcmd: user-menu: navigate', (t) => {
    const el = {
        length: 3,
        selectedIndex: 0,
    };
    
    navigate(el, {
        keyCode: 0,
    });
    
    t.equal(el.selectedIndex, 0, 'should not change');
    t.end();
});

