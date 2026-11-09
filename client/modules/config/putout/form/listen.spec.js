import {test, stub} from 'supertape';
import {listen} from './listen.js';

const actions = [{
    event: 'input',
    render: false,
}, {
    event: 'change',
    render: true,
}];

const createRoot = () => {
    const handlers = {};
    
    return {
        handlers,
        addEventListener: stub((event, handler) => {
            handlers[event] = handler;
        }),
        removeEventListener: stub(),
    };
};

test('cloudcmd: client: config: putout: form: listen: add listeners', (t) => {
    const root = createRoot();
    
    listen(root, actions, stub());
    
    const [[first], [second]] = root.addEventListener.args;
    const result = [first, second];
    const expected = [
        'input',
        'change',
    ];
    
    t.deepEqual(result, expected);
    t.end();
});

test('cloudcmd: client: config: putout: form: listen: target with name', (t) => {
    const root = createRoot();
    const onAction = stub();
    const target = {
        dataset: {
            name: 'js-port',
        },
    };
    
    listen(root, actions, onAction);
    root.handlers.change({
        target,
    });
    
    const expected = [{
        target,
        render: true,
    }];
    
    t.calledWith(onAction, expected);
    t.end();
});

test('cloudcmd: client: config: putout: form: listen: input: no render', (t) => {
    const root = createRoot();
    const onAction = stub();
    const target = {
        dataset: {
            name: 'js-port',
        },
    };
    
    listen(root, actions, onAction);
    root.handlers.input({
        target,
    });
    
    const [[{render}]] = onAction.args;
    
    t.notOk(render);
    t.end();
});

test('cloudcmd: client: config: putout: form: listen: target without name', (t) => {
    const root = createRoot();
    const onAction = stub();
    
    listen(root, actions, onAction);
    root.handlers.change({
        target: {
            dataset: {},
        },
    });
    
    t.notCalled(onAction);
    t.end();
});

test('cloudcmd: client: config: putout: form: listen: target without dataset', (t) => {
    const root = createRoot();
    const onAction = stub();
    
    listen(root, actions, onAction);
    root.handlers.change({
        target: {},
    });
    
    t.notCalled(onAction);
    t.end();
});

test('cloudcmd: client: config: putout: form: listen: stop', (t) => {
    const root = createRoot();
    const stop = listen(root, actions, stub());
    
    stop();
    
    const [[inputEvent, inputHandler], [changeEvent, changeHandler]] = root.removeEventListener.args;
    const result = [
        inputEvent,
        inputHandler === root.handlers.input,
        changeEvent,
        changeHandler === root.handlers.change,
    ];
    const expected = [
        'input',
        true,
        'change',
        true,
    ];
    
    t.deepEqual(result, expected);
    t.end();
});
