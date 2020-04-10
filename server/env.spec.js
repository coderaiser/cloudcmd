'use strict';

const test = require('supertape');
const env = require('./env');

test('cloudcmd: server: env: bool: upper case first', (t) => {
    const {CLOUDCMD_TERMINAL} = process.env;
    const {cloudcmd_terminal} = process.env;
    
    process.env.cloudcmd_terminal = 'true';
    process.env.CLOUDCMD_TERMINAL = 'false';
    
    const result = env.bool('terminal');
    
    t.notOk(result);
    t.end();
});

