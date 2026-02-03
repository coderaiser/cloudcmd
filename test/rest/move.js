import {EventEmitter} from 'node:events';
import wait from '@iocmd/wait';
import {test, stub} from 'supertape';
import serveOnce from 'serve-once';
import cloudcmd from '../../server/cloudcmd.js';

test('cloudcmd: rest: move', async (t) => {
    const move = new EventEmitter();
    const moveFiles = stub().returns(move);
    
    const {createConfigManager} = cloudcmd;
    cloudcmd.depStore('moveFiles', moveFiles);
    
    const configManager = createConfigManager();
    configManager('auth', false);
    configManager('root', '/');
    
    const {request} = serveOnce(cloudcmd, {
        configManager,
    });
    
    const files = {
        from: '/fixture/',
        to: '/fixture/tmp/',
        names: ['move.txt'],
    };
    
    const emit = move.emit.bind(move);
    
    const [{body}] = await Promise.all([
        request.put(`/api/v1/move`, {
            body: files,
        }),
        wait(1000, emit, 'end'),
    ]);
    
    t.equal(body, 'move: ok("["move.txt"]")', 'should move');
    t.end();
});

test('cloudcmd: rest: move: no from', async (t) => {
    const {createConfigManager} = cloudcmd;
    
    const configManager = createConfigManager();
    configManager('auth', false);
    configManager('root', '/');
    
    const {request} = serveOnce(cloudcmd, {
        configManager,
    });
    
    const files = {};
    
    const {body} = await request.put(`/api/v1/move`, {
        body: files,
    });
    
    const expected = '"from" should be filled';
    
    t.equal(body, expected);
    t.end();
});

test('cloudcmd: rest: move: no to', async (t) => {
    const {createConfigManager} = cloudcmd;
    
    const configManager = createConfigManager();
    configManager('auth', false);
    configManager('root', '/');
    
    const {request} = serveOnce(cloudcmd, {
        configManager,
    });
    
    const files = {
        from: '/',
    };
    
    const {body} = await request.put(`/api/v1/move`, {
        body: files,
    });
    
    const expected = '"to" should be filled';
    
    t.equal(body, expected);
    t.end();
});
