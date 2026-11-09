import {test, stub} from 'supertape';
import {loadModule} from './load-module.js';

const isPutout = (path) => path.includes('putout');

const createCloudCmd = () => {
    const loaded = [];
    
    const CloudCmd = {
        DIR_MODULES: '/dist/modules',
        log: stub(),
    };
    
    globalThis.CloudCmd = CloudCmd;
    
    const loadJS = stub((path) => {
        loaded.push(path);
        
        const [, name] = /\/(\w+)\.js$/.exec(path);
        const Name = name[0].toUpperCase() + name.slice(1);
        
        CloudCmd[Name] = {
            init: stub(),
        };
    });
    
    return {
        CloudCmd,
        loaded,
        loadJS,
    };
};

test('cloudcmd: client: loadModule: requires: loaded before the module', async (t) => {
    const {
        CloudCmd,
        loaded,
        loadJS,
    } = createCloudCmd();
    
    loadModule({
        path: 'putout',
    }, {
        loadJS,
    });
    
    loadModule({
        path: 'menu',
        requires: () => [
            'putout',
        ],
    }, {
        loadJS,
    });
    
    await CloudCmd.Menu();
    const result = loaded;
    
    const expected = [
        '/dist/modules/putout.js',
        '/dist/modules/menu.js',
    ];
    
    t.deepEqual(result, expected);
    t.end();
});

test('cloudcmd: client: loadModule: requires: loaded once', async (t) => {
    const {
        CloudCmd,
        loaded,
        loadJS,
    } = createCloudCmd();
    
    loadModule({
        path: 'putout',
    }, {
        loadJS,
    });
    
    loadModule({
        path: 'menu',
        requires: () => [
            'putout',
        ],
    }, {
        loadJS,
    });
    
    loadModule({
        path: 'config',
        requires: () => [
            'putout',
        ],
    }, {
        loadJS,
    });
    
    await Promise.all([
        CloudCmd.Menu(),
        CloudCmd.Config(),
    ]);
    
    const result = loaded.filter(isPutout);
    const expected = ['/dist/modules/putout.js'];
    
    t.deepEqual(result, expected);
    t.end();
});

test('cloudcmd: client: loadModule: requires: empty', async (t) => {
    const {
        CloudCmd,
        loaded,
        loadJS,
    } = createCloudCmd();
    
    loadModule({
        path: 'menu',
        requires: () => [],
    }, {
        loadJS,
    });
    
    await CloudCmd.Menu();
    const result = loaded;
    const expected = ['/dist/modules/menu.js'];
    
    t.deepEqual(result, expected);
    t.end();
});

test('cloudcmd: client: loadModule: show: calls show of the module', async (t) => {
    const {CloudCmd, loadJS} = createCloudCmd();
    const show = stub();
    
    const loadWithShow = stub(async (path) => {
        await loadJS(path);
        CloudCmd.Menu.show = show;
    });
    
    loadModule({
        path: 'menu',
    }, {
        loadJS: loadWithShow,
    });
    
    await CloudCmd.Menu.show('hello');
    
    t.calledWith(show, ['hello']);
    t.end();
});

test('cloudcmd: client: loadModule: show: load error', async (t) => {
    const {CloudCmd} = createCloudCmd();
    
    const loadJS = stub(
        stub().rejects(Error('not found')),
    );
    
    loadModule({
        path: 'menu',
    }, {
        loadJS,
    });
    
    const result = await CloudCmd.Menu.show('hello');
    
    t.notOk(result);
    t.end();
});

test('cloudcmd: client: loadModule: no params', (t) => {
    const {CloudCmd} = createCloudCmd();
    
    loadModule();
    
    t.notOk(CloudCmd.Menu);
    t.end();
});

test('cloudcmd: client: loadModule: already registered', (t) => {
    const {CloudCmd, loadJS} = createCloudCmd();
    const registered = stub();
    
    CloudCmd.Menu = registered;
    
    loadModule({
        path: 'menu',
    }, {
        loadJS,
    });
    
    t.equal(CloudCmd.Menu, registered);
    t.end();
});

test('cloudcmd: client: loadModule: loaded module calls a function', async (t) => {
    const {CloudCmd, loadJS} = createCloudCmd();
    const fn = stub();
    
    loadModule({
        path: 'menu',
    }, {
        loadJS,
    });
    
    const menu = await CloudCmd.Menu();
    
    await menu(fn);
    
    t.calledOnce(fn);
    t.end();
});
