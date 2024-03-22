import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import serveOnce from 'serve-once';
import {mkdirSync} from 'node:fs';
import test from 'supertape';
import rimraf from 'rimraf';
import cloudcmd from '../../server/cloudcmd.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config = {
    root: new URL('..', import.meta.url).pathname,
};

const configManager = cloudcmd.createConfigManager();

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
        names: ['copy.txt'],
    };
    
    mkdirSync(tmp);
    
    const {body} = await request.put(`/api/v1/copy`, {
        body: files,
    });
    
    rimraf.sync(tmp);
    
    t.equal(body, 'copy: ok("["copy.txt"]")', 'should return result');
    t.end();
});
