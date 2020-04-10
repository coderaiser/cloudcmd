'use strict';

const test = require('supertape');
const env = require('./env');

test('cloudcmd: server: env: bool: upper case first', (t) => {
    const {
        CLOUDCMD_TERMINAL,
        cloudcmd_terminal,
    } = process.env;
    
    process.env.cloudcmd_terminal = 'true';
    process.env.CLOUDCMD_TERMINAL = 'false';
    
    const result = env.bool('terminal');
    
    process.env.cloudcmd_terminal = cloudcmd_terminal;
    process.env.CLOUDCMD_TERMINAL = CLOUDCMD_TERMINAL;
    
    t.notOk(result);
    t.end();
});

