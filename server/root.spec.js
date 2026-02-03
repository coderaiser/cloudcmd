import {test, stub} from 'supertape';
import root from './root.js';

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
