import {test, stub} from 'supertape';
import {render} from '../render.js';
import {attachForm} from './form.js';

const toAttribute = ([name, value]) => ({
    name,
    value,
});

const hasName = (name) => ({dataset}) => dataset.name === name;

const template = '<div><input data-name="js-auth" type="checkbox" {{ auth }}><input data-enabled-by="auth" data-name="js-username" type="text" value="{{ username }}"></div>';

const config = {
    auth: false,
    username: 'root',
};

const createFake = (attributes) => {
    const map = new Map(Object.entries(attributes));
    
    return {
        type: attributes.type,
        value: attributes.value,
        checked: map.has('checked'),
        dataset: {
            name: attributes['data-name'],
        },
        get attributes() {
            return Array.from(map, toAttribute);
        },
        getAttribute: (name) => map.has(name) ? map.get(name) : null,
        hasAttribute: (name) => map.has(name),
        setAttribute: (name, value) => {
            map.set(name, value);
        },
        removeAttribute: (name) => {
            map.delete(name);
        },
    };
};

const parseInputs = (html) => {
    const inputs = html.matchAll(/<input([^>]*)>/g);
    const result = [];
    
    for (const input of inputs) {
        const attributes = {};
        const pairs = input[1].matchAll(/([\w-]+)(?:="([^"]*)")?/g);
        
        for (const pair of pairs)
            attributes[pair[1]] = pair[2] || '';
        
        result.push(createFake(attributes));
    }
    
    return result;
};

const createRoot = (html) => {
    const handlers = {};
    const elements = parseInputs(html);
    
    return {
        elements,
        handlers,
        addEventListener: (event, handler) => {
            handlers[event] = handler;
        },
        removeEventListener: stub(),
        querySelector: (selector) => {
            const [, name] = selector.match(/data-name="([^"]+)"/);
            
            return elements.find(hasName(name));
        },
        querySelectorAll: () => elements,
    };
};

const mount = (options = {}) => {
    const html = render(config, template);
    const root = createRoot(html);
    
    globalThis.document = {
        activeElement: null,
        createElement: () => ({
            set innerHTML(value) {
                this.html = value;
            },
            get content() {
                return {
                    querySelectorAll: () => parseInputs(this.html),
                };
            },
        }),
    };
    
    const form = attachForm(root, {
        config,
        template,
        ...options,
    });
    
    const [auth, username] = root.elements;
    
    return {
        root,
        form,
        auth,
        username,
    };
};

const unmount = () => {
    delete globalThis.document;
};

test('cloudcmd: client: config: putout: form: render: the rule sets disabled', (t) => {
    const {username} = mount();
    
    unmount();
    const result = username.hasAttribute('disabled');
    
    t.ok(result);
    t.end();
});

test('cloudcmd: client: config: putout: form: change: the rule removes disabled', (t) => {
    const {
        root,
        auth,
        username,
    } = mount();
    
    auth.checked = true;
    root.handlers.change({
        target: auth,
    });
    
    unmount();
    const result = username.hasAttribute('disabled');
    
    t.notOk(result);
    t.end();
});

test('cloudcmd: client: config: putout: form: change: the rule adds disabled', (t) => {
    const {
        root,
        auth,
        username,
    } = mount();
    
    auth.checked = true;
    root.handlers.change({
        target: auth,
    });
    auth.checked = false;
    root.handlers.change({
        target: auth,
    });
    
    unmount();
    const result = username.hasAttribute('disabled');
    
    t.ok(result);
    t.end();
});

test('cloudcmd: client: config: putout: form: change: render count', (t) => {
    const {
        root,
        form,
        auth,
    } = mount();
    
    root.handlers.change({
        target: auth,
    });
    
    unmount();
    
    t.equal(form.stats.renders, 1);
    t.end();
});

test('cloudcmd: client: config: putout: form: input: no render', (t) => {
    const {
        root,
        form,
        username,
    } = mount();
    
    username.value = 'typed';
    root.handlers.input({
        target: username,
    });
    
    unmount();
    
    t.equal(form.stats.renders, 0);
    t.end();
});

test('cloudcmd: client: config: putout: form: input: state has the typed text', (t) => {
    const {
        root,
        form,
        username,
    } = mount();
    
    username.value = 'typed';
    root.handlers.input({
        target: username,
    });
    
    unmount();
    
    const {username: result} = form.read();
    
    t.equal(result, 'typed');
    t.end();
});

test('cloudcmd: client: config: putout: form: change: keep the typed text of the active element', (t) => {
    const {
        root,
        auth,
        username,
    } = mount();
    
    username.value = 'typed';
    root.handlers.input({
        target: username,
    });
    globalThis.document.activeElement = username;
    auth.checked = true;
    root.handlers.change({
        target: auth,
    });
    
    unmount();
    
    t.equal(username.value, 'typed');
    t.end();
});

test('cloudcmd: client: config: putout: form: change: onCommit', (t) => {
    const onCommit = stub();
    const {root, auth} = mount({
        onCommit,
    });
    
    auth.checked = true;
    root.handlers.change({
        target: auth,
    });
    
    unmount();
    
    t.calledWith(onCommit, ['auth', true]);
    t.end();
});

test('cloudcmd: client: config: putout: form: input: onCommit', (t) => {
    const onCommit = stub();
    const {root, username} = mount({
        onCommit,
    });
    
    username.value = 'typed';
    root.handlers.input({
        target: username,
    });
    
    unmount();
    
    t.calledWith(onCommit, ['username', 'typed']);
    t.end();
});

test('cloudcmd: client: config: putout: form: set: state only', (t) => {
    const onCommit = stub();
    const {form} = mount({
        onCommit,
    });
    
    form.set('username', 'server');
    
    unmount();
    
    const {username} = form.read();
    const result = [username, form.stats.renders, onCommit.callCount];
    const expected = ['server', 0, 0];
    
    t.deepEqual(result, expected);
    t.end();
});

test('cloudcmd: client: config: putout: form: stop', (t) => {
    const {root, form} = mount();
    
    form.stop();
    
    unmount();
    
    t.equal(root.removeEventListener.callCount, 2);
    t.end();
});
