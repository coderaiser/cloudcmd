'use strict';

const {test, stub} = require('supertape');

const root = require('./root');

test('cloudcmd: root: mellow', (t) => {
    const webToWin = stub();
    
    const dir = 'hello';
    const dirRoot = '/';
    
    root(dir, '', {
        webToWin,
    });
    
    t.calledWith(webToWin, [dir, dirRoot], 'should call mellow');
    t.end();
});
