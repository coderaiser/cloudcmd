import {spawnSync} from 'node:child_process';
import {mkdtempSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import process from 'node:process';
import {test} from 'supertape';
import info from '../package.json' with {
    type: 'json',
};

const cliPath = new URL('cloudcmd.js', import.meta.url).pathname;

test('cloudcmd: bin: cli: -h', (t) => {
    const {stdout} = spawnSync(cliPath, ['-h'], {
        encoding: 'utf8',
    });
    
    t.match(stdout, `Options`);
    t.end();
});

test('cloudcmd: bin: cli: -v', (t) => {
    const {version} = info;
    const {stdout} = spawnSync(cliPath, ['-v'], {
        encoding: 'utf8',
    });
    
    t.match(stdout, `v${version}`);
    t.end();
});

const readConfig = (args, env = {}) => {
    const home = mkdtempSync(join(tmpdir(), 'cloudcmd-'));
    
    const {stdout} = spawnSync(cliPath, [
        ...args,
        '--show-config',
        '--no-server',
    ], {
        encoding: 'utf8',
        env: {
            ...process.env,
            ...env,
            HOME: home,
        },
    });
    
    return stdout;
};

test('cloudcmd: bin: cli: --packer', (t) => {
    const stdout = readConfig(['--packer', 'zip']);
    
    t.match(stdout, /packer\s+\| zip/);
    t.end();
});

test('cloudcmd: bin: cli: --no-zip', (t) => {
    const stdout = readConfig(['--no-zip']);
    
    t.match(stdout, /zip\s+\| false/);
    t.end();
});

test('cloudcmd: bin: cli: env: CLOUDCMD_KEYS_PANEL=false', (t) => {
    const stdout = readConfig([], {
        CLOUDCMD_KEYS_PANEL: 'false',
    });
    
    t.match(stdout, /keysPanel\s+\| false/);
    t.end();
});

test('cloudcmd: bin: cli: --engine: default', (t) => {
    const stdout = readConfig([]);
    
    t.match(stdout, /engine\s+\| rendy/);
    t.end();
});

test('cloudcmd: bin: cli: --engine putout', (t) => {
    const stdout = readConfig(['--engine', 'putout']);
    
    t.match(stdout, /engine\s+\| putout/);
    t.end();
});

test('cloudcmd: bin: cli: env: CLOUDCMD_ENGINE=putout', (t) => {
    const stdout = readConfig([], {
        CLOUDCMD_ENGINE: 'putout',
    });
    
    t.match(stdout, /engine\s+\| putout/);
    t.end();
});
