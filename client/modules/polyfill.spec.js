'use strict';

const {test, stub} = require('supertape');
const {scrollIntoViewIfNeeded} = require('./polyfill');

test('cloudcmd: client: polyfill: scrollIntoViewIfNeaded', (t) => {
    const scroll = stub();
    const el = {};
    
    scrollIntoViewIfNeeded(el, {
        scroll,
    });
    
    const args = [
        el, {
            block: 'nearest',
        },
    ];
    
    t.calledWith(scroll, args, 'should call scrollIntoViewIfNeaded');
    t.end();
});
