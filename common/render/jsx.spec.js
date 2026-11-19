import {
    parse,
    print,
    traverse,
} from 'putout';
import {test} from 'supertape';
import {
    addFlag,
    escape,
    getAttribute,
    getName,
    getText,
    hasAttribute,
    removeAttribute,
    setAttribute,
    toOptionName,
} from '#common/render/jsx';

const parseFirst = (source) => {
    const ast = parse(source);
    let path = null;
    
    traverse(ast, {
        JSXElement(current) {
            path = current;
            current.stop();
        },
    });
    
    return {
        ast,
        path,
    };
};

test('cloudcmd: common: render: jsx: getName', (t) => {
    const {path} = parseFirst('<button/>;');
    const result = getName(path);
    const expected = 'button';
    
    t.equal(result, expected);
    t.end();
});

test('cloudcmd: common: render: jsx: hasAttribute: exists', (t) => {
    const {path} = parseFirst('<b id="a"/>;');
    
    t.ok(hasAttribute(path, 'id'));
    t.end();
});

test('cloudcmd: common: render: jsx: hasAttribute: absent', (t) => {
    const {path} = parseFirst('<b/>;');
    
    t.notOk(hasAttribute(path, 'id'));
    t.end();
});

test('cloudcmd: common: render: jsx: getAttribute: exists', (t) => {
    const {path} = parseFirst('<b id="a"/>;');
    const result = getAttribute(path, 'id');
    const expected = 'a';
    
    t.equal(result, expected);
    t.end();
});

test('cloudcmd: common: render: jsx: getAttribute: absent', (t) => {
    const {path} = parseFirst('<b/>;');
    const result = getAttribute(path, 'id');
    const expected = '';
    
    t.equal(result, expected);
    t.end();
});

test('cloudcmd: common: render: jsx: setAttribute: new', (t) => {
    const {ast, path} = parseFirst('<b/>;');
    
    setAttribute(path, 'id', 'a');
    
    t.match(print(ast), 'id="a"');
    t.end();
});

test('cloudcmd: common: render: jsx: setAttribute: exists', (t) => {
    const {ast, path} = parseFirst('<b id="a"/>;');
    
    setAttribute(path, 'id', 'b');
    
    t.match(print(ast), 'id="b"');
    t.end();
});

test('cloudcmd: common: render: jsx: setAttribute: escape', (t) => {
    const {ast, path} = parseFirst('<b/>;');
    
    setAttribute(path, 'id', '<');
    
    t.match(print(ast), 'id="&lt;"');
    t.end();
});

test('cloudcmd: common: render: jsx: addFlag', (t) => {
    const {ast, path} = parseFirst('<b/>;');
    
    addFlag(path, 'hidden');
    
    t.match(print(ast), 'hidden');
    t.end();
});

test('cloudcmd: common: render: jsx: removeAttribute', (t) => {
    const {ast, path} = parseFirst('<b id="a"/>;');
    
    removeAttribute(path, 'id');
    
    t.notMatch(print(ast), 'id');
    t.end();
});

test('cloudcmd: common: render: jsx: removeAttribute: keeps the other', (t) => {
    const {ast, path} = parseFirst('<b id="a" title="t"/>;');
    
    removeAttribute(path, 'id');
    
    t.match(print(ast), 'title="t"');
    t.end();
});

test('cloudcmd: common: render: jsx: toOptionName', (t) => {
    const result = toOptionName('js-name');
    const expected = 'name';
    
    t.equal(result, expected);
    t.end();
});

test('cloudcmd: common: render: jsx: escape', (t) => {
    const result = escape('<');
    const expected = '&lt;';
    
    t.equal(result, expected);
    t.end();
});

test('cloudcmd: common: render: jsx: getText', (t) => {
    const {path} = parseFirst('<b> a </b>;');
    const result = getText(path);
    const expected = 'a';
    
    t.equal(result, expected);
    t.end();
});
