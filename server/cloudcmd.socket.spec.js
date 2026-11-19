import http from 'node:http';
import {Buffer} from 'node:buffer';
import {Server} from 'socket.io';
import {io as connectClient} from 'socket.io-client';
import criton from 'criton';
import {test} from 'supertape';
import cloudcmd, {
    createConfigManager,
} from '#server/cloudcmd';

const basic = (name, pass) => `Basic ${Buffer
    .from(`${name}:${pass}`)
    .toString('base64')}`;

async function start({auth}) {
    const config = createConfigManager();
    
    config('auth', auth);
    config('username', 'root');
    config('password', criton('secret', config('algo')));
    config('configDialog', false);
    config('dropbox', false);
    config('terminal', false);
    
    const server = http.createServer();
    const socket = new Server(server);
    
    cloudcmd({
        socket,
        configManager: config,
    });
    
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    
    const {port} = server.address();
    const url = `http://127.0.0.1:${port}`;
    
    const close = async () => {
        await socket.close();
    };
    
    return {
        url,
        config,
        close,
    };
}

function connect(url, authorization) {
    return new Promise((resolve) => {
        const client = connectClient(url, {
            transports: ['polling'],
            reconnection: false,
            extraHeaders: authorization ? {
                authorization,
            } : {},
        });
        
        client.on('connect', () => {
            client.close();
            resolve(true);
        });
        
        client.on('connect_error', () => {
            client.close();
            resolve(false);
        });
    });
}

test('cloudcmd: socket: auth disabled: should connect without credentials', async (t) => {
    const {url, close} = await start({
        auth: false,
    });
    
    const result = await connect(url);
    
    await close();
    
    t.ok(result);
    t.end();
});

test('cloudcmd: socket: auth enabled: should reject without credentials', async (t) => {
    const {url, close} = await start({
        auth: true,
    });
    
    const result = await connect(url);
    
    await close();
    
    t.notOk(result);
    t.end();
});

test('cloudcmd: socket: auth enabled: should reject stored password hash', async (t) => {
    const {
        url,
        config,
        close,
    } = await start({
        auth: true,
    });
    
    const result = await connect(url, basic('root', config('password')));
    
    await close();
    
    t.notOk(result);
    t.end();
});

test('cloudcmd: socket: auth enabled: should connect with right password', async (t) => {
    const {url, close} = await start({
        auth: true,
    });
    
    const result = await connect(url, basic('root', 'secret'));
    
    await close();
    
    t.ok(result);
    t.end();
});

test('cloudcmd: socket: auth toggled on at runtime: should reject without credentials', async (t) => {
    const {
        url,
        config,
        close,
    } = await start({
        auth: false,
    });
    
    config('auth', true);
    
    const result = await connect(url);
    await close();
    
    t.notOk(result);
    t.end();
});

