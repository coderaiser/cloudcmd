import process from 'node:process';
import {spawn} from 'node:child_process';
import {test} from 'supertape';

test('cloudcmd: server: ratelimit: x-forwarded-for', async (t) => {
    const PORT = 3000;
    const child = await run(PORT);
    
    const {status} = await fetch(`http://localhost:${PORT}`, {
        headers: {
            'X-Forwarded-For': '127.0.0.1',
        },
    });
    
    child.kill();
    
    t.notEqual(status, 500);
    t.end();
});

test('cloudcmd: server: ratelimit', async (t) => {
    const PORT = 3001;
    const STATUS = 429;
    
    const child = await run(PORT);
    
    for (let i = 0; i < 1000; i++) {
        await fetch(`http://localhost:${PORT}`);
    }
    
    const {status} = await fetch(`http://localhost:${PORT}`);
    child.kill();
    
    t.equal(status, STATUS);
    t.end();
});

function run(port) {
    return new Promise((resolve, reject) => {
        const child = spawn(new URL('../bin/cloudcmd.js', import.meta.url).pathname, [], {
            env: {
                ...process.env,
                PORT: port,
            },
            stdio: ['ignore', 'pipe', 'pipe'],
        });
        
        child.stdout.on('data', (a) => {
            if (a.toString().includes('url'))
                resolve(child);
        });
        
        child.on('error', reject);
    });
}
