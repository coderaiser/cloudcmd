import process from 'node:process';
import {test} from 'supertape';

test('cloudcmd: server: ratelimit', async (t) => {
    const PORT = 3000;
    const STATUS = 429;
    
    process.env.PORT = PORT;
    process.env.CLOUDCMD_LOG = 0;
    
    await import('../../bin/cloudcmd.js');
    
    for (let i = 0; i < 1000; i++) {
        await fetch(`http://localhost:${PORT}`);
    }
    
    const {status} = await fetch(`http://localhost:${PORT}`);
    process.kill(process.pid, 'SIGUSR1');
    
    t.equal(status, STATUS);
    t.end();
});
