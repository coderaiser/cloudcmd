'use strict';

const {test, stub} = require('supertape');
const {isAudio, _detectType} = require('./types');

test('cloudcmd: client: view: types: isAudio', (t) => {
    const result = isAudio('hello.mp3');
    
    t.ok(result);
    t.end();
});

test('cloudcmd: client: view: types: isAudio: no', (t) => {
    const result = isAudio('hello');
    
    t.notOk(result);
    t.end();
});

test('cloudcmd: client: view: types: detectType', async (t) => {
    const fetch = stub().returns({
        headers: [],
    });
    
    globalThis.fetch = fetch;
    await _detectType('/hello');
    
    const expected = ['/hello', {
        method: 'HEAD',
    }];
    
    t.calledWith(fetch, expected);
    t.end();
});

test('cloudcmd: client: view: types: detectType: found', async (t) => {
    globalThis.fetch = stub().returns({
        headers: [
            ['content-type', 'image/png'],
        ],
    });
    const result = await _detectType('/hello');
    
    t.equal(result, '.png');
    t.end();
});
