'use strict';

const test = require('supertape');
const navigate = require('./navigate');

const {
    UP,
    DOWN,
    J,
    K,
} = require('../../key/key.mjs');

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

test('cloudcmd: user-menu: navigate: DOWN: count', (t) => {
    const el = {
        length: 3,
        selectedIndex: 0,
    };
    
    navigate(el, {
        keyCode: 53,
        key: '5',
    });
    
    navigate(el, {
        keyCode: DOWN,
    });
    
    t.equal(el.selectedIndex, 5);
    t.end();
});

test('cloudcmd: user-menu: navigate: J: count: to big', (t) => {
    const el = {
        length: 3,
        selectedIndex: -Infinity,
    };
    
    navigate(el, {
        keyCode: 53,
        key: '5',
    });
    
    navigate(el, {
        keyCode: J,
    });
    
    t.equal(el.selectedIndex, 2);
    t.end();
});

test('cloudcmd: user-menu: navigate: K: count: to small', (t) => {
    const el = {
        length: 3,
        selectedIndex: -Infinity,
    };
    
    navigate(el, {
        keyCode: 53,
        key: '5',
    });
    
    navigate(el, {
        keyCode: K,
    });
    
    t.equal(el.selectedIndex, 0);
    t.end();
});
