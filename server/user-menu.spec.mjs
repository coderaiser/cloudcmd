import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {readFileSync} from 'node:fs';
import {test, stub} from 'supertape';
import serveOnce from 'serve-once';
import userMenu from './user-menu.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const {request} = serveOnce(userMenu);
const userMenuPath = join(__dirname, '..', '.cloudcmd.menu.js');
const userMenuFile = readFileSync(userMenuPath, 'utf8');

const fixtureDir = new URL('fixture-user-menu', import.meta.url).pathname;
const fixtureMoveName = join(fixtureDir, 'io-mv.js');
const fixtureMoveFixName = join(fixtureDir, 'io-mv-fix.js');
const fixtureCopyName = join(fixtureDir, 'io-cp.js');
const fixtureCopyFixName = join(fixtureDir, 'io-cp-fix.js');

const fixtureMove = readFileSync(fixtureMoveName, 'utf8');
const fixtureMoveFix = readFileSync(fixtureMoveFixName, 'utf8');
const fixtureCopy = readFileSync(fixtureCopyName, 'utf8');
const fixtureCopyFix = readFileSync(fixtureCopyFixName, 'utf8');

test('cloudcmd: user menu', async (t) => {
    const options = {
        menuName: '.cloudcmd.menu.js',
    };
    
    const {body} = await request.get(`/api/v1/user-menu?dir=${__dirname}`, {
        options,
    });
    
    t.equal(userMenuFile, body);
    t.end();
});

test('cloudcmd: user menu: io.mv', async (t) => {
    const readFile = stub().returns(fixtureMove);
    const options = {
        menuName: '.cloudcmd.menu.js',
        readFile,
    };
    
    const {request} = serveOnce(userMenu);
    
    const {body} = await request.get(`/api/v1/user-menu?dir=${__dirname}`, {
        options,
    });
    
    t.equal(body, fixtureMoveFix);
    t.end();
});

test('cloudcmd: user menu: io.cp', async (t) => {
    const readFile = stub().returns(fixtureCopy);
    const options = {
        menuName: '.cloudcmd.menu.js',
        readFile,
    };
    
    const {request} = serveOnce(userMenu);
    
    const {body} = await request.get(`/api/v1/user-menu?dir=${__dirname}`, {
        options,
    });
    
    t.equal(body, fixtureCopyFix);
    t.end();
});
