import process from 'node:process';
import {test} from 'supertape';

let i = 0;

test('cloudcmd: server: ratelimit: x-forwarded-for', async (t) => {
    const PORT = 3000;
    
    process.env.PORT = PORT;
    process.env.CLOUDCMD_LOG = 0;
    
    await import('../bin/cloudcmd.js');
    
    const {status} = await fetch(`http://localhost:${PORT}`, {
        headers: {
            'X-Forwarded-For': '127.0.0.1',
        },
    });
    
    process.kill(process.pid, 'SIGUSR1');
    
    t.notEqual(status, 500);
    t.end();
});

test('cloudcmd: server: ratelimit', async (t) => {
    const PORT = 3001;
    const STATUS = 429;
    
    process.env.PORT = PORT;
    process.env.CLOUDCMD_LOG = 0;
    
    await import(`../bin/cloudcmd.js?${i++}`);
    
    for (let i = 0; i < 1000; i++) {
        await fetch(`http://localhost:${PORT}`);
    }
    
    const {status} = await fetch(`http://localhost:${PORT}`);
    process.kill(process.pid, 'SIGUSR1');
    
    t.equal(status, STATUS);
    t.end();
});
