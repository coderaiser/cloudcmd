'use strict';

const test = require('supertape');
const getUserMenu = require('./get-user-menu');

test('user-menu: getUserMenu', (t) => {
    const menu = `module.exports = {
        'F2 - Rename file': ({DOM}) => {
            const {element} = DOM.CurrentInfo;
            DOM.renameCurrent(element);
        }
    }`;
    
    const result = getUserMenu(menu);
    
    const [key] = Object.keys(result);
    
    t.equal(key, 'F2 - Rename file', 'should equal');
    t.end();
});

