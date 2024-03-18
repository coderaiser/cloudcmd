import {mkdirSync} from 'node:fs';
import {join, dirname} from 'node:path';
import test from 'supertape';
import {rimraf} from 'rimraf';
import {fileURLToPath} from 'node:url';
import cloudcmd from '../../server/cloudcmd.mjs';

const __filename = fileURLToPath(import.meta.url);

const __dirname = dirname(__filename);
const configManager = cloudcmd.createConfigManager();

configManager('auth', false);

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
