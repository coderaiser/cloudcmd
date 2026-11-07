import {spawn} from 'node:child_process';
import {createServer} from 'node:net';
import {
    copyFile,
    mkdir,
    mkdtemp,
    readdir,
    rm,
    writeFile,
} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {test as base, expect} from '@playwright/test';

const FIXTURE = path.resolve('test-e2e/client/fixture');
const PACK_ZIP = path.resolve('test/fixture/pack.zip');
const BIN = path.resolve('bin/cloudcmd.js');

const getFreePort = () => new Promise((resolve, reject) => {
    const server = createServer();
    
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
        const {port} = server.address();
        
        server.close(() => resolve(port));
    });
});

const waitForServer = async (url, child) => {
    for (let i = 0; i < 100; i++) {
        if (child.exitCode !== null)
            throw Error(`cloudcmd exited with code ${child.exitCode}`);
        
        try {
            const response = await fetch(url);
            
            if (response.status < 500)
                return;
        } catch {
            // server is not ready yet
        }
        
        await new Promise((resolve) => setTimeout(resolve, 100));
    }
    
    throw Error(`cloudcmd did not start: ${url}`);
};

const seed = async (root) => {
    for (const name of await readdir(FIXTURE))
        await copyFile(path.join(FIXTURE, name), path.join(root, name));
    
    await mkdir(path.join(root, 'dir1'));
    await mkdir(path.join(root, 'dir2'));
    await writeFile(path.join(root, 'dir1', 'inner.txt'), 'inner\n');
    await writeFile(path.join(root, 'edit.txt'), 'hello\n');
    await writeFile(path.join(root, 'data.json'), '{"answer": 42}\n');
    await writeFile(path.join(root, 'note.md'), '# Note title\n\nbody\n');
    await writeFile(path.join(root, 'bad.zip'), 'this is not a zip\n');
    await copyFile(PACK_ZIP, path.join(root, 'archive.zip'));
};

export const test = base.extend({
    // Extra cloudcmd flags. Override with test.use({flags: [...]}).
    flags: [[], {option: true}],
    // Extra files. Override with test.use({extraFiles: {'name': 'content'}}).
    extraFiles: [{}, {option: true}],
    
    server: async ({flags, extraFiles}, use) => {
        const dir = await mkdtemp(path.join(tmpdir(), 'cloudcmd-e2e-'));
        const root = path.join(dir, 'root');
        const home = path.join(dir, 'home');
        
        await mkdir(root);
        await mkdir(home);
        await seed(root);
        
        for (const [name, content] of Object.entries(extraFiles))
            await writeFile(path.join(root, name), content);
        
        const port = await getFreePort();
        const url = `http://127.0.0.1:${port}`;
        const child = spawn(process.execPath, [
            BIN,
            '--no-open',
            '--port',
            String(port),
            '--root',
            root,
            ...flags.includes('--auth') ? [] : ['--no-auth'],
            ...flags,
        ], {
            env: {
                ...process.env,
                HOME: home,
            },
            stdio: 'ignore',
        });
        
        try {
            await waitForServer(url, child);
            await use({root, url, home});
        } finally {
            child.kill();
            await rm(dir, {
                recursive: true,
                force: true,
            });
        }
    },
    
    baseURL: async ({server}, use) => {
        await use(server.url);
    },
});

export {expect};
