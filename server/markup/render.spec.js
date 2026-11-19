import {readFileSync} from 'node:fs';
import {test} from 'supertape';
import {render} from './render.js';

const allOn = {
    keysPanel: true,
    oneFilePanel: false,
    console: true,
    contact: true,
    configDialog: true,
    terminal: true,
};

const hideAll = {
    ...allOn,
    keysPanel: false,
    oneFilePanel: true,
    console: false,
    contact: false,
    configDialog: false,
    terminal: false,
};

const BACKSLASH = '\\';

const template = readFileSync(new URL('../../tmpl/index.hbs', import.meta.url), 'utf8');

const data = {
    fm: '<ul class="files"></ul>',
    prefix: '/cloud',
    columns: '<style>columns</style>',
    themes: '<style>themes</style>',
    config: '{"name":"x"}',
};

test('cloudcmd: server: markup: render: data: fm', (t) => {
    t.match(render(allOn, template, data), '<div data-name="js-fm" class="fm"><ul class="files"></ul></div>');
    t.end();
});

test('cloudcmd: server: markup: render: data: prefix: escape', (t) => {
    const result = render(allOn, template, {
        ...data,
        prefix: '/"x',
    });
    
    t.match(result, 'href="/&quot;x/favicon.ico"');
    t.end();
});

test('cloudcmd: server: markup: render: data: prefix: icon', (t) => {
    t.match(render(allOn, template, data), 'href="/cloud/favicon.ico"');
    t.end();
});

test('cloudcmd: server: markup: render: data: prefix: script', (t) => {
    t.match(render(allOn, template, data), 'src="/cloud/dist/cloudcmd.js"');
    t.end();
});

test('cloudcmd: server: markup: render: data: columns', (t) => {
    t.match(render(allOn, template, data), '<style>columns</style>');
    t.end();
});

test('cloudcmd: server: markup: render: data: themes', (t) => {
    t.match(render(allOn, template, data), '<style>themes</style>');
    t.end();
});

test('cloudcmd: server: markup: render: data: config', (t) => {
    t.match(render(allOn, template, data), 'CloudCmd({"name":"x"});');
    t.end();
});

test('cloudcmd: server: markup: render: data: class name: file name', (t) => {
    const result = render(allOn, template, {
        ...data,
        fm: '<li>classNames.js</li>',
    });
    
    t.match(result, '<li>className&#101;s.js</li>');
    t.end();
});

test('cloudcmd: server: markup: render: data: class name: config', (t) => {
    const result = render(allOn, template, {
        ...data,
        config: '{"a":"className"}',
    });
    
    const [, argument] = result.match(/CloudCmd\((.*)\);/);
    
    t.equal(argument, `{"a":"className${BACKSLASH}u0065"}`);
    t.end();
});

test('cloudcmd: server: markup: render: data: no placeholders left', (t) => {
    t.notMatch(render(allOn, template, data), /\{(fm|prefix|columns|themes|config)\}/);
    t.end();
});

test('cloudcmd: server: markup: render: doctype', (t) => {
    const result = render(allOn, template, data).startsWith('<!DOCTYPE html>');
    
    t.ok(result);
    t.end();
});

test('cloudcmd: server: markup: render: new line at the end', (t) => {
    const result = render(allOn, template, data).endsWith('\n');
    
    t.ok(result);
    t.end();
});

test('cloudcmd: server: markup: render: remove: visible-by', (t) => {
    t.notMatch(render(allOn, template, data), 'data-visible-by');
    t.end();
});

test('cloudcmd: server: markup: render: remove: hide-with', (t) => {
    t.notMatch(render(allOn, template, data), 'data-hide-with');
    t.end();
});

test('cloudcmd: server: markup: render: show all: no none', (t) => {
    t.notMatch(render(allOn, template, data), ' none');
    t.end();
});

test('cloudcmd: server: markup: render: show all: no hidden', (t) => {
    t.notMatch(render(allOn, template, data), 'keyspanel hidden');
    t.end();
});

test('cloudcmd: server: markup: render: hide: keys panel', (t) => {
    t.match(render(hideAll, template, data), 'keyspanel hidden');
    t.end();
});

test('cloudcmd: server: markup: render: hide: copy', (t) => {
    t.match(render(hideAll, template, data), 'icon-copy none');
    t.end();
});

test('cloudcmd: server: markup: render: hide: move', (t) => {
    t.match(render(hideAll, template, data), 'icon-move none');
    t.end();
});

test('cloudcmd: server: markup: render: hide: console', (t) => {
    t.match(render(hideAll, template, data), 'icon-console none');
    t.end();
});

test('cloudcmd: server: markup: render: hide: contact', (t) => {
    t.match(render(hideAll, template, data), 'icon-contact none');
    t.end();
});

test('cloudcmd: server: markup: render: hide: config', (t) => {
    t.match(render(hideAll, template, data), 'icon-config none');
    t.end();
});

test('cloudcmd: server: markup: render: hide: terminal', (t) => {
    t.match(render(hideAll, template, data), 'icon-terminal none');
    t.end();
});
