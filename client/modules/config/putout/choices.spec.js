import {readFileSync} from 'node:fs';
import {test, stub} from 'supertape';
import config from '../../../../json/config.json' with {
    type: 'json',
};
import * as validate from '../../../../server/validate.js';
import choices from './choices.json' with {
    type: 'json',
};

const read = (name) => readFileSync(new URL(name, import.meta.url), 'utf8');
const template = read('../../../../tmpl/config.hbs');
const golden = read('../fixture/form.html');

const getSecond = ([, name]) => name;
const getAll = (source, regexp) => Array.from(source.matchAll(regexp), getSecond);
const names = getAll(template, /data-name="js-(\w+)"/g);

const getOptions = (name) => {
    const [select] = template.match(RegExp(`data-name="js-${name}"[\\s\\S]*?</select>`));
    
    return Array.from(select.matchAll(/<option[^>]*>([^<]+)<\/option>/g), getSecond);
};

const isRejected = (name) => (value) => {
    const exit = stub();
    
    validate[name](value, {
        exit,
    });
    
    return exit.called;
};

const isUnknown = (name) => !(name in config);

test('cloudcmd: client: config: putout: template: names: exist in the config', (t) => {
    const result = names
        .filter(isUnknown)
        .join();
    
    t.equal(result, '');
    t.end();
});

test('cloudcmd: client: config: putout: template: names: unique', (t) => {
    const result = new Set(names).size;
    
    t.equal(result, names.length);
    t.end();
});

test('cloudcmd: client: config: putout: template: names: same order as in the fixture', (t) => {
    const expected = getAll(golden, /data-name="js-(\w+)"/g);
    const result = names.join();
    
    t.equal(result, expected.join());
    t.end();
});

test('cloudcmd: client: config: putout: choices: theme: same as in the template', (t) => {
    const result = choices.theme;
    const expected = getOptions('theme');
    
    t.deepEqual(result, expected);
    t.end();
});

test('cloudcmd: client: config: putout: choices: theme: default is one of the choices', (t) => {
    const result = choices.theme
        .filter((a) => a === config.theme)
        .join();
    
    t.equal(result, config.theme);
    t.end();
});

test('cloudcmd: client: config: putout: choices: theme: accepted by validate', (t) => {
    const result = choices.theme
        .filter(isRejected('theme'))
        .join();
    
    t.equal(result, '');
    t.end();
});

test('cloudcmd: client: config: putout: choices: columns: same as in the template', (t) => {
    const result = choices.columns;
    const expected = getOptions('columns');
    
    t.deepEqual(result, expected);
    t.end();
});

test('cloudcmd: client: config: putout: choices: columns: default is one of the choices', (t) => {
    const result = choices.columns
        .filter((a) => a === config.columns)
        .join();
    
    t.equal(result, config.columns);
    t.end();
});

test('cloudcmd: client: config: putout: choices: columns: accepted by validate', (t) => {
    const result = choices.columns
        .filter(isRejected('columns'))
        .join();
    
    t.equal(result, '');
    t.end();
});

test('cloudcmd: client: config: putout: choices: editor: same as in the template', (t) => {
    const result = choices.editor;
    const expected = getOptions('editor');
    
    t.deepEqual(result, expected);
    t.end();
});

test('cloudcmd: client: config: putout: choices: editor: default is one of the choices', (t) => {
    const result = choices.editor
        .filter((a) => a === config.editor)
        .join();
    
    t.equal(result, config.editor);
    t.end();
});

test('cloudcmd: client: config: putout: choices: editor: accepted by validate', (t) => {
    const result = choices.editor
        .filter(isRejected('editor'))
        .join();
    
    t.equal(result, '');
    t.end();
});

test('cloudcmd: client: config: putout: choices: menu: same as in the template', (t) => {
    const result = choices.menu;
    const expected = getOptions('menu');
    
    t.deepEqual(result, expected);
    t.end();
});

test('cloudcmd: client: config: putout: choices: menu: default is one of the choices', (t) => {
    const result = choices.menu
        .filter((a) => a === config.menu)
        .join();
    
    t.equal(result, config.menu);
    t.end();
});

test('cloudcmd: client: config: putout: choices: menu: accepted by validate', (t) => {
    const result = choices.menu
        .filter(isRejected('menu'))
        .join();
    
    t.equal(result, '');
    t.end();
});

test('cloudcmd: client: config: putout: choices: packer: same as in the template', (t) => {
    const result = choices.packer;
    const expected = getOptions('packer');
    
    t.deepEqual(result, expected);
    t.end();
});

test('cloudcmd: client: config: putout: choices: packer: default is one of the choices', (t) => {
    const result = choices.packer
        .filter((a) => a === config.packer)
        .join();
    
    t.equal(result, config.packer);
    t.end();
});

test('cloudcmd: client: config: putout: choices: packer: accepted by validate', (t) => {
    const result = choices.packer
        .filter(isRejected('packer'))
        .join();
    
    t.equal(result, '');
    t.end();
});
