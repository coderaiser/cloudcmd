'use strict';

const test = require('supertape');
const {isAudio} = require('./types');

test('cloudcmd: client: view: isAudio', (t) => {
    const result = isAudio('hello.mp3');
    
    t.ok(result);
    t.end();
});

test('cloudcmd: client: view: isAudio: no', (t) => {
    const result = isAudio('hello');
    
    t.notOk(result);
    t.end();
});

