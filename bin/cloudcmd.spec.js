import {spawnSync} from 'node:child_process';
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
