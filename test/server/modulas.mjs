import {createRequire} from 'module';
import {
    dirname,
    join,
} from 'path';
import {fileURLToPath} from 'url';
import serveOnce from 'serve-once';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);
import {
    test,
    stub,
} from 'supertape';

const cloudcmdPath = join(__dirname, '..', '..');
const modulesPath = join(cloudcmdPath, 'json', 'modules.json');

const localModules = require(modulesPath);
const modulas = require(`${cloudcmdPath}/server/modulas`);

import cloudcmd from '../../server/cloudcmd.mjs';

const {request} = serveOnce(cloudcmd, {
    config: {
        auth: false,
        dropbox: false,
    },
});

test('cloudcmd: modules', async (t) => {
    const modules = {
        data: {
            FilePicker: {
                key: 'hello',
            },
        },
    };
    const options = {
        modules,
    };
    
    const expected = {
        ...localModules,
        ...modules,
    };
    
    const {body} = await request.get(`/json/modules.json`, {
        type: 'json',
        options,
    });
    
    t.deepEqual(body, expected);
    t.end();
});

test('cloudcmd: modules: wrong route', async (t) => {
    const modules = {
        hello: 'world',
    };
    
    const options = {
        modules,
    };
    
    const expected = {
        ...localModules,
        ...modules,
    };
    
    const {body} = await request.get(`/package.json`, {
        type: 'json',
        options,
    });
    
    t.notDeepEqual(body, expected, 'should not be equal');
    t.end();
});

test('cloudcmd: modules: no', (t) => {
    const fn = modulas();
    const url = '/json/modules.json';
    const send = stub();
    
    fn({url}, {send});
    
    t.calledWith(send, [localModules], 'should have been called with modules');
    t.end();
});

