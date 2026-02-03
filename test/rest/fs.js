import serveOnce from 'serve-once';
import test from 'supertape';
import {cloudcmd} from '#server/cloudcmd';

const {request} = serveOnce(cloudcmd, {
    config: {
        auth: false,
    },
});

test('cloudcmd: rest: fs: path', async (t) => {
    const {body} = await request.get(`/api/v1/fs`, {
        type: 'json',
    });
    
    const {path} = body;
    
    t.equal(path, '/', 'should dir path be "/"');
    t.end();
});

test('cloudcmd: path traversal beyond root', async (t) => {
    const {body} = await request.get('/fs..%2f..%2fetc/passwd');
    
    t.match(body, 'beyond root', 'should return beyond root message');
    t.end();
});
