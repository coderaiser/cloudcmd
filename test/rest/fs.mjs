import serveOnce from 'serve-once';

import test from 'supertape';

import cloudcmd from '../...js';

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

