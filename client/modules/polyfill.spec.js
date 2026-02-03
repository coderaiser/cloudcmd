import {test, stub} from 'supertape';
import {scrollIntoViewIfNeeded} from './polyfill.js';

test('cloudcmd: client: polyfill: scrollIntoViewIfNeeded', (t) => {
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
    
    t.calledWith(scroll, args, 'should call scrollIntoViewIfNeeded');
    t.end();
});
