import test from 'supertape';
import stub from '@cloudcmd/stub';
import mockRequire from 'mock-require';
const {reRequire} = mockRequire;

const pathConfig = './config';
const pathRoot = './root';

test('cloudcmd: root: mellow', (t) => {
    const config = stub().returns('');
    const pathToWin = stub();
    
    const mellow = {
        pathToWin,
    };
    
    mockRequire('mellow', mellow);
    mockRequire(pathConfig, config);
    
    const root = reRequire(pathRoot);
    const dir = 'hello';
    const dirRoot = '/';
    
    root(dir);
    
    mockRequire.stop('mellow');
    mockRequire.stopAll(pathConfig);
    reRequire(pathRoot);
    
    t.calledWith(pathToWin, [dir, dirRoot], 'should call mellow');
    t.end();
});

