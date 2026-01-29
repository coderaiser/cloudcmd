import {test, stub} from 'supertape';
import * as storage from '#dom/storage';

const {stringify} = JSON;

test('cloudcmd: client: storage: set', async (t) => {
    const {localStorage} = globalThis;
    const setItem = stub();
    
    globalThis.localStorage = {
        setItem,
    };
    
    await storage.set('hello', 'world');
    globalThis.localStorage = localStorage;
    
    t.calledWith(setItem, ['hello', 'world'], 'should call setItem');
    t.end();
});

test('cloudcmd: client: storage: get', async (t) => {
    const {localStorage} = globalThis;
    const getItem = stub().returns('world');
    
    globalThis.localStorage = {
        getItem,
    };
    
    const result = await storage.get('hello');
    
    globalThis.localStorage = localStorage;
    
    t.equal(result, 'world');
    t.end();
});

test('cloudcmd: client: storage: getJson', async (t) => {
    const {localStorage} = globalThis;
    const expected = {
        hello: 'world',
    };
    
    const getItem = stub().returns(stringify(expected));
    
    globalThis.localStorage = {
        getItem,
    };
    
    const result = await storage.getJson('hello');
    
    globalThis.localStorage = localStorage;
    
    t.deepEqual(result, expected);
    t.end();
});

test('cloudcmd: client: storage: setJson', async (t) => {
    const {localStorage} = globalThis;
    const data = {
        hello: 'world',
    };
    
    const expected = stringify(data);
    const setItem = stub();
    
    globalThis.localStorage = {
        setItem,
    };
    
    await storage.setJson('hello', data);
    globalThis.localStorage = localStorage;
    
    t.calledWith(setItem, ['hello', expected]);
    t.end();
});

test('cloudcmd: client: storage: remove', async (t) => {
    const {localStorage} = globalThis;
    const removeItem = stub();
    
    globalThis.localStorage = {
        removeItem,
    };
    
    await storage.remove('hello');
    globalThis.localStorage = localStorage;
    
    t.calledWith(removeItem, ['hello'], 'should call removeItem');
    t.end();
});

test('cloudcmd: client: storage: clear', async (t) => {
    const {localStorage} = globalThis;
    const clear = stub();
    
    globalThis.localStorage = {
        clear,
    };
    
    await storage.clear();
    globalThis.localStorage = localStorage;
    
    t.calledWithNoArgs(clear, 'should call clear');
    t.end();
});
