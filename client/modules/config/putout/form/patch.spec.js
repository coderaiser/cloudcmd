import {test} from 'supertape';
import {tryCatch} from 'try-catch';
import {patch} from './patch.js';

const toAttribute = ([name, value]) => ({
    name,
    value,
});

const toEntry = ({name, value}) => [name, value];

const createFake = (attributes = {}, properties = {}) => {
    const map = new Map(Object.entries(attributes));
    
    return {
        ...properties,
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

const createRoot = (...elements) => ({
    querySelectorAll: () => elements,
});

const read = (element) => Object.fromEntries(element.attributes.map(toEntry));

test('cloudcmd: client: config: putout: form: patch: set a changed attribute', (t) => {
    const live = createFake({
        title: 'old',
    });
    
    const next = createFake({
        title: 'new',
    });
    
    patch(createRoot(live), createRoot(next), {});
    
    const result = read(live);
    const expected = {
        title: 'new',
    };
    
    t.deepEqual(result, expected);
    t.end();
});

test('cloudcmd: client: config: putout: form: patch: add an attribute', (t) => {
    const live = createFake();
    const next = createFake({
        disabled: '',
    });
    
    patch(createRoot(live), createRoot(next), {});
    
    const result = read(live);
    const expected = {
        disabled: '',
    };
    
    t.deepEqual(result, expected);
    t.end();
});

test('cloudcmd: client: config: putout: form: patch: remove a missing attribute', (t) => {
    const live = createFake({
        disabled: '',
        title: 'same',
    });
    
    const next = createFake({
        title: 'same',
    });
    
    patch(createRoot(live), createRoot(next), {});
    
    const result = read(live);
    const expected = {
        title: 'same',
    };
    
    t.deepEqual(result, expected);
    t.end();
});

test('cloudcmd: client: config: putout: form: patch: the same attribute', (t) => {
    const live = createFake({
        title: 'same',
    });
    
    const next = createFake({
        title: 'same',
    });
    
    let count = 0;
    const {setAttribute} = live;
    
    live.setAttribute = (...args) => {
        ++count;
        setAttribute(...args);
    };
    
    patch(createRoot(live), createRoot(next), {});
    
    t.equal(count, 0);
    t.end();
});

test('cloudcmd: client: config: putout: form: patch: value of the active element', (t) => {
    const live = createFake({
        value: 'typed',
    });
    
    const next = createFake({
        value: 'state',
    });
    
    patch(createRoot(live), createRoot(next), {
        activeElement: live,
    });
    
    const result = read(live);
    
    const expected = {
        value: 'typed',
    };
    
    t.deepEqual(result, expected);
    t.end();
});

test('cloudcmd: client: config: putout: form: patch: value of another element', (t) => {
    const live = createFake({
        value: 'old',
    });
    
    const next = createFake({
        value: 'state',
    });
    
    patch(createRoot(live), createRoot(next), {
        activeElement: createFake(),
    });
    
    const result = read(live);
    
    const expected = {
        value: 'state',
    };
    
    t.deepEqual(result, expected);
    t.end();
});

test('cloudcmd: client: config: putout: form: patch: other attribute of the active element', (t) => {
    const live = createFake({
        title: 'old',
    });
    
    const next = createFake({
        title: 'new',
    });
    
    patch(createRoot(live), createRoot(next), {
        activeElement: live,
    });
    
    const result = read(live);
    
    const expected = {
        title: 'new',
    };
    
    t.deepEqual(result, expected);
    t.end();
});

test('cloudcmd: client: config: putout: form: patch: checkbox: on', (t) => {
    const live = createFake({}, {
        type: 'checkbox',
        checked: false,
    });
    
    const next = createFake({
        checked: '',
    });
    
    patch(createRoot(live), createRoot(next), {});
    
    t.ok(live.checked);
    t.end();
});

test('cloudcmd: client: config: putout: form: patch: checkbox: off', (t) => {
    const live = createFake({
        checked: '',
    }, {
        type: 'checkbox',
        checked: true,
    });
    
    const next = createFake();
    
    patch(createRoot(live), createRoot(next), {});
    
    t.notOk(live.checked);
    t.end();
});

test('cloudcmd: client: config: putout: form: patch: not a checkbox', (t) => {
    const live = createFake({}, {
        type: 'text',
    });
    
    const next = createFake({
        checked: '',
    });
    
    patch(createRoot(live), createRoot(next), {});
    
    t.notOk(live.checked);
    t.end();
});

test('cloudcmd: client: config: putout: form: patch: the number of elements is different', (t) => {
    const [error] = tryCatch(patch, createRoot(createFake()), createRoot(), {});
    
    t.equal(error.message, 'The structure of the form changed');
    t.end();
});
