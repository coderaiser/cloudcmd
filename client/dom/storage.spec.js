'use strict';

const test = require('supertape');
const stub = require('@cloudcmd/stub');
const storage = require('./storage');

const {stringify} = JSON;

test('cloudcmd: client: storage: set', async (t) => {
    const {localStorage} = global;
    const setItem = stub();
    
    global.localStorage = {
        setItem,
    };
    
    await storage.set('hello', 'world');
    global.localStorage = localStorage;
    
    t.ok(setItem.calledWith('hello', 'world'), 'should call setItem');
    t.end();
});

test('cloudcmd: client: storage: get', async (t) => {
    const {localStorage} = global;
    const getItem = stub().returns('world');
    
    global.localStorage = {
        getItem,
    };
    
    const result = await storage.get('hello');
    global.localStorage = localStorage;
    
    t.equal(result, 'world');
    t.end();
});

test('cloudcmd: client: storage: getJson', async (t) => {
    const {localStorage} = global;
    const expected = {
        hello: 'world',
    };
    const getItem = stub().returns(stringify(expected));
    
    global.localStorage = {
        getItem,
    };
    
    const result = await storage.getJson('hello');
    global.localStorage = localStorage;
    
    t.deepEqual(result, expected);
    t.end();
});

test('cloudcmd: client: storage: setJson', async (t) => {
    const {localStorage} = global;
    const data = {
        hello: 'world',
    };
    
    const expected = stringify(data);
    const setItem = stub();
    
    global.localStorage = {
        setItem,
    };
    
    await storage.setJson('hello', data);
    global.localStorage = localStorage;
    
    t.ok(setItem.calledWith('hello', expected));
    t.end();
});
