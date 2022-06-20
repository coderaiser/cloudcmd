import {dirname} from 'path';
import {fileURLToPath} from 'url';
const __filename = fileURLToPath(import.meta.url);
import {createMockImport} from 'mock-import';

const {reImport} = createMockImport(import.meta.url);

const __dirname = dirname(__filename);

import fs from 'fs';
import {join} from 'path';
import {promisify} from 'util';

import test from 'supertape';
import tar from 'tar-stream';
import gunzip from 'gunzip-maybe';
import pullout from 'pullout';

const cloudcmdPath = '../..';
import cloudcmd from '../../server/cloudcmd.mjs';
import serveOnce from 'serve-once';

const pathZipFixture = join(__dirname, '..', 'fixture/pack.zip');

const pathTarFixture = join(__dirname, '..', 'fixture/pack.tar.gz');

const defaultOptions = {
    config: {
        auth: false,
        root: new URL('..', import.meta.url).pathname,
    },
};

const fixture = {
    tar: fs.readFileSync(pathTarFixture),
    zip: fs.readFileSync(pathZipFixture),
};
const {request} = serveOnce(cloudcmd, defaultOptions);

const once = promisify((name, extract, fn) => {
    extract.once(name, (header, stream) => {
        fn(null, [header, stream]);
    });
});

test('cloudcmd: rest: pack: tar: get', async (t) => {
    const config = {
        packer: 'tar',
        auth: false,
    };
    
    const options = {
        config,
    };
    
    const {cloudcmd} = await reImport('../../server/cloudcmd.mjs');
    const {request} = serveOnce(cloudcmd, defaultOptions);
    
    const {body} = await request.get(`/api/v1/pack/fixture/pack`, {
        options,
        type: 'stream',
    });
    
    const extract = tar.extract();
    
    body.pipe(gunzip()).pipe(extract);
    
    const [, stream] = await once('entry', extract);
    const data = await pullout(stream);
    const file = fs.readFileSync(__dirname + '/../fixture/pack', 'utf8');
    
    t.equal(file, data, 'should pack data');
    t.end();
});

test('cloudcmd: rest: pack: tar: put: file', async (t) => {
    const config = {
        packer: 'tar',
    };
    
    const options = {
        config,
    };
    
    const name = String(Math.random()) + '.tar.gz';
    
    const {request} = serveOnce(cloudcmd, defaultOptions);
    
    await request.put(`/api/v1/pack`, {
        options,
        body: getPackOptions(name),
    });
    
    const file = fs.createReadStream(join(__dirname, '..', name));
    const extract = tar.extract();
    
    file.pipe(gunzip()).pipe(extract);
    
    const [, stream] = await once('entry', extract);
    const data = await pullout(stream, 'buffer');
    const result = fs.readFileSync(__dirname + '/../fixture/pack');
    
    fs.unlinkSync(`${__dirname}/../${name}`);
    
    t.deepEqual(result, data, 'should create archive');
    t.end();
});

test('cloudcmd: rest: pack: tar: put: response', async (t) => {
    const config = {
        packer: 'tar',
    };
    
    const options = {
        config,
    };
    
    const name = String(Math.random()) + '.tar.gz';
    const {body} = await request.put(`/api/v1/pack`, {
        options,
        body: getPackOptions(name),
    });
    
    fs.unlinkSync(`${__dirname}/../${name}`);
    
    t.equal(body, 'pack: ok("fixture")', 'should return result message');
    t.end();
});

test('cloudcmd: rest: pack: tar: put: error', async (t) => {
    const config = {
        packer: 'tar',
    };
    
    const options = {
        config,
    };
    
    const {body} = await request.put(`/api/v1/pack`, {
        options,
        body: getPackOptions('name', [
            'not found',
        ]),
    });
    
    t.match(body, /^ENOENT: no such file or directory/, 'should return error');
    t.end();
});

test('cloudcmd: rest: pack: zip: get', async (t) => {
    const config = {
        packer: 'zip',
    };
    
    const options = {
        config,
    };
    
    const {body} = await request.get(`/api/v1/pack/fixture/pack`, {
        options,
        type: 'buffer',
    });
    
    t.equal(body.length, fixture.zip.length, 'should pack data');
    t.end();
});

test('cloudcmd: rest: pack: zip: put: file', async (t) => {
    const config = {
        packer: 'zip',
    };
    
    const options = {
        config,
    };
    
    const name = String(Math.random()) + '.zip';
    await request.put(`/api/v1/pack`, {
        options,
        body: getPackOptions(name),
    });
    
    const file = fs.readFileSync(__dirname + '/../' + name);
    fs.unlinkSync(`${__dirname}/../${name}`);
    
    t.equal(fixture.zip.length, file.length, 'should create archive');
    t.end();
});

test('cloudcmd: rest: pack: zip: put: response', async (t) => {
    const config = {
        packer: 'zip',
    };
    
    const options = {
        config,
    };
    
    const name = String(Math.random()) + '.zip';
    const {body} = await request.put(`/api/v1/pack`, {
        options,
        body: getPackOptions(name),
    });
    
    fs.unlinkSync(`${__dirname}/../${name}`);
    
    t.equal(body, 'pack: ok("fixture")', 'should return result message');
    t.end();
});

test('cloudcmd: rest: pack: zip: put: error', async (t) => {
    const config = {
        packer: 'zip',
        auth: false,
    };
    
    const options = {
        config,
    };
    
    const {body} = await request.put(`/api/v1/pack`, {
        options,
        body: getPackOptions('name', [
            'not found',
        ]),
    });
    
    t.match(body, /^ENOENT: no such file or directory/, 'should return error');
    t.end();
});

function getPackOptions(to, names = ['pack']) {
    return {
        to,
        names,
        from: '/fixture',
    };
}

