import {dirname} from 'path';
import {fileURLToPath} from 'url';
import serveOnce from 'serve-once';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import {mkdirSync} from 'fs';
import {join} from 'path';
import test from 'supertape';
import rimraf from 'rimraf';

const config = {
    root: new URL('..', import.meta.url).pathname,
};

import cloudcmd, {
    createConfigManager,
} from '../../server/cloudcmd.mjs';
const configManager = createConfigManager();

configManager('auth', false);

const {request} = serveOnce(cloudcmd, {
    config,
    configManager,
});

const fixtureDir = join(__dirname, '..', 'fixture') + '/';

test('cloudcmd: rest: copy', async (t) => {
    const tmp = join(fixtureDir, 'tmp');
    const files = {
        from: '/fixture/',
        to: '/fixture/tmp',
        names: [
            'copy.txt',
        ],
    };
    
    mkdirSync(tmp);
    
    const {body} = await request.put(`/api/v1/copy`, {
        body: files,
    });
    
    rimraf.sync(tmp);
    
    t.equal(body, 'copy: ok("["copy.txt"]")', 'should return result');
    t.end();
});

