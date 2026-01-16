'use strict';

const process = require('node:process');
const test = require('supertape');
const env = require('./env.mjs');

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

test('cloudcmd: server: env: bool: snake_case', (t) => {
    process.env.cloudcmd_config_auth = 'true';
    
    const result = env.bool('configAuth');
    
    t.ok(result);
    t.end();
});

test('cloudcmd: server: env: bool: number', (t) => {
    const {cloudcmd_terminal} = process.env;
    
    process.env.CLOUDCMD_TERMINAL = '1';
    
    const result = env.bool('terminal');
    
    process.env.CLOUDCMD_TERMINAL = cloudcmd_terminal;
    
    t.ok(result);
    t.end();
});

test('cloudcmd: server: env: bool: number: 0', (t) => {
    const {cloudcmd_terminal} = process.env;
    
    process.env.cloudcmd_terminal = '0';
    
    const result = env.bool('terminal');
    
    process.env.cloudcmd_terminal = cloudcmd_terminal;
    
    t.notOk(result);
    t.end();
});
