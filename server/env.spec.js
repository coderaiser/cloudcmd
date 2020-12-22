import test from 'supertape';
import env from './env.js';

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
