import {test, stub} from 'supertape';
import {tryToCatch} from 'try-to-catch';
import {
    _formatMsg,
    _getWin32RootMsg,
    _isRootWin32,
    _isRootAll,
    _onPUT,
    _UserError,
    _getPackReg,
    _getCMD,
    _rename,
    _getPacker,
} from './index.js';

test('rest: formatMsg', (t) => {
    const result = _formatMsg('hello', 'world');
    
    t.equal(result, 'hello: ok("world")', 'should be equal');
    t.end();
});

test('rest: formatMsg: json', (t) => {
    const result = _formatMsg('hello', {
        name: 'world',
    });
    
    t.equal(result, 'hello: ok("{"name":"world"}")', 'should parse json');
    t.end();
});

test('rest: getWin32RootMsg', (t) => {
    const {message} = _getWin32RootMsg();
    
    t.equal(message, 'Could not copy from/to root on windows!', 'should return error');
    t.end();
});

test('rest: isRootWin32', (t) => {
    const result = _isRootWin32('/', '/');
    
    t.notOk(result, 'should equal');
    t.end();
});

test('rest: isRootAll', (t) => {
    const result = _isRootAll('/', ['/', '/h']);
    
    t.notOk(result, 'should equal');
    t.end();
});

test('rest: onPUT: no args', async (t) => {
    const [e] = await tryToCatch(_onPUT, {});
    
    t.equal(e.message, 'name should be a string!', 'should throw when no args');
    t.end();
});

test('rest: onPUT: no body', async (t) => {
    const [e] = await tryToCatch(_onPUT, {
        name: 'hello',
    });
    
    t.equal(e.message, 'body should be a string!', 'should throw when no body');
    t.end();
});

test('rest: onPUT: no callback', async (t) => {
    const [e] = await tryToCatch(_onPUT, {
        name: 'hello',
        body: 'world',
    });
    
    t.equal(e.message, 'callback should be a function!', 'should throw when no callback');
    t.end();
});

test('rest: UserError: message', (t) => {
    const result = _UserError('hello');
    
    t.equal(result.message, 'hello', 'should set message');
    t.end();
});

test('rest: UserError: code', (t) => {
    const result = _UserError('hello');
    
    t.equal(result.code, 'EUSER', 'should set code');
    t.end();
});

test('rest: getPackReg: zip', (t) => {
    const result = _getPackReg('zip');
    
    t.match('file.zip', result, 'should match .zip');
    t.end();
});

test('rest: getPackReg: tar', (t) => {
    const result = _getPackReg('tar');
    
    t.match('file.tar.gz', result, 'should match .tar.gz');
    t.end();
});

test('rest: getCMD: with slash', (t) => {
    const result = _getCMD('/move');
    
    t.equal(result, 'move', 'should strip leading slash');
    t.end();
});

test('rest: getCMD: no slash', (t) => {
    const result = _getCMD('move');
    
    t.equal(result, 'move', 'should return as is');
    t.end();
});

test('rest: rename: no from', (t) => {
    const callback = stub();
    
    _rename('/', null, 'to', null, callback);
    
    const msg = '"from" should be filled';
    
    t.calledWith(callback, [
        _UserError(msg),
    ], 'should return UserError');
    t.end();
});

test('rest: rename: no to', (t) => {
    const callback = stub();
    
    _rename('/', 'from', null, null, callback);
    
    const msg = '"to" should be filled';
    
    t.calledWith(callback, [
        _UserError(msg),
    ], 'should return UserError');
    t.end();
});

test('rest: rename: success', (t) => {
    const callback = stub();
    const fs = {
        rename: stub(),
    };
    
    _rename('/root', 'from', 'to', fs, callback);
    
    t.calledWith(fs.rename, ['/root/from', '/root/to', callback], 'should call fs.rename');
    t.end();
});

test('rest: getPacker: extract', (t) => {
    const result = _getPacker('extract', 'zip');
    
    t.equal(typeof result, 'function', 'should return function');
    t.end();
});

test('rest: getPacker: pack zip', (t) => {
    const result = _getPacker('pack', 'zip');
    
    t.equal(typeof result, 'function', 'should return function');
    t.end();
});

test('rest: getPacker: pack tar', (t) => {
    const result = _getPacker('pack', 'tar');
    
    t.equal(typeof result, 'function', 'should return function');
    t.end();
});
