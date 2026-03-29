import {spawnSync} from 'node:child_process';
import {test} from 'supertape';

const cliPath = new URL('cloudcmd.js', import.meta.url).pathname;
import info from '../package.json' with {
    type: 'json',
}

test('cloudcmd: bin: cli: -h', (t) => {
    const {version} = info;
    const {stdout} = spawnSync(cliPath, ['-h'], {
        encoding: 'utf8',
    });
    
    t.match(stdout, `Options`);
    t.end();
});
