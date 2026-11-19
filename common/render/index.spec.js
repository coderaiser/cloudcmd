import {operator} from 'putout';
import currify from 'currify';
import {tryToCatch} from 'try-to-catch';
import {test} from 'supertape';
import {render} from './index.js';

const {addClassName} = operator;

const report = () => 'Add a class';
const include = () => [
    'JSXElement',
];
const isTag = currify((tag, path) => path.node.openingElement.name.name === tag);

const addClass = currify((name, path) => {
    addClassName(path, name);
});

const addX = {
    report,
    include,
    filter: isTag('b'),
    fix: addClass('x'),
};

const addConfigName = {
    report,
    include,
    filter: isTag('i'),
    fix: (path, {options}) => {
        addClassName(path, options.config.name);
    },
};

const addA = {
    report,
    include,
    filter: isTag('u'),
    fix: addClass('a'),
};

const addB = {
    report,
    include,
    filter: isTag('u'),
    fix: addClass('b'),
};

const identity = (a) => a;
const fromElement = () => '<b/>;';
const fromBroken = () => '<<';
const toDone = () => 'done';
const toTemplate = (code, template) => template;

test('cloudcmd: common: render: applies a rule', (t) => {
    const result = render('<b></b>', {
        rules: [
            ['test/add-x', addX],
        ],
        options: {},
    });
    
    t.match(result, '<b class="x">');
    t.end();
});

test('cloudcmd: common: render: gives options to a rule', (t) => {
    const result = render('<i></i>', {
        rules: [
            ['test/add-config-name', addConfigName],
        ],
        options: {
            config: {
                name: 'y',
            },
        },
    });
    
    t.match(result, '<i class="y">');
    t.end();
});

test('cloudcmd: common: render: applies many rules', (t) => {
    const result = render('<p><b></b><i></i></p>', {
        rules: [
            ['test/add-x', addX],
            ['test/add-config-name', addConfigName],
        ],
        options: {
            config: {
                name: 'y',
            },
        },
    });
    
    t.match(result, /class="x"[^]*class="y"/);
    t.end();
});

test('cloudcmd: common: render: keeps the order of rules', (t) => {
    const result = render('<u></u>', {
        rules: [
            ['test/add-a', addA],
            ['test/add-b', addB],
        ],
        options: {},
    });
    
    t.match(result, 'class="a b"');
    t.end();
});

test('cloudcmd: common: render: no rules: keeps the template', (t) => {
    const result = render('<b></b>', {
        rules: [],
        options: {},
    });
    
    t.match(result, '<b></b>');
    t.end();
});

test('cloudcmd: common: render: default format is html', (t) => {
    const result = render('<!DOCTYPE html><b></b>', {
        rules: [],
        options: {},
    });
    
    t.ok(result.startsWith('<!DOCTYPE html>'));
    t.end();
});

test('cloudcmd: common: render: format: from', (t) => {
    const result = render('ignored', {
        rules: [
            ['test/add-x', addX],
        ],
        options: {},
        format: {
            from: fromElement,
            to: identity,
        },
    });
    
    t.match(result, '<b className="x"/>');
    t.end();
});

test('cloudcmd: common: render: format: to', (t) => {
    const result = render('<b></b>', {
        rules: [],
        options: {},
        format: {
            from: identity,
            to: toDone,
        },
    });
    
    t.equal(result, 'done');
    t.end();
});

test('cloudcmd: common: render: format: to: gets the template', (t) => {
    const result = render('ignored', {
        rules: [],
        options: {},
        format: {
            from: fromElement,
            to: toTemplate,
        },
    });
    
    t.equal(result, 'ignored');
    t.end();
});

test('cloudcmd: common: render: invalid source: throws', async (t) => {
    const [error] = await tryToCatch(render, '<b></b>', {
        rules: [],
        options: {},
        format: {
            from: fromBroken,
            to: identity,
        },
    });
    
    t.ok(error);
    t.end();
});
