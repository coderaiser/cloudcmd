import test from 'supertape';
import {serveOnce} from 'serve-once';
import {cloudcmd} from '#server/cloudcmd';

test('cloudcmd: rest: extract: path traversal: from', async (t) => {
    const configManager = cloudcmd.createConfigManager();
    configManager('auth', false);
    configManager('root', '/sandbox');
    
    const {request} = serveOnce(cloudcmd, {
        configManager,
    });
    
    const {body} = await request.put('/api/v1/extract', {
        body: {
            from: '../../../../tmp/cc-outside/evil.zip',
        },
    });
    
    t.equal(body, 'Path /tmp/cc-outside/evil.zip beyond root /sandbox!', 'should reject traversal in from');
    t.end();
});
