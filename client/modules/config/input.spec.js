import {test, stub} from 'supertape';
import {convert, getName, getValue, setValue} from './input.js';

test('cloudcmd: client: config: input: convert', (t) => {
    const result = convert({
        name: 'hello <world>',
    });
    
    const expected = {
        name: 'hello &lt;world&gt;',
    };
    
    t.deepEqual(result, expected);
    t.end();
});

test('cloudcmd: client: config: input: convert: bool', (t) => {
    const result = convert({
        auth: true,
    });
    
    const expected = {
        auth: ' checked',
    };
    
    t.deepEqual(result, expected);
    t.end();
});

test('cloudcmd: client: config: input: convert: bool false', (t) => {
    const result = convert({
        auth: false,
    });
    
    const expected = {
        auth: '',
    };
    
    t.deepEqual(result, expected);
    t.end();
});

test('cloudcmd: client: config: input: getName', (t) => {
    const getAttribute = stub().returns('js-hello');
    const element = {getAttribute};
    
    const result = getName(element);
    
    t.equal(result, 'hello', 'should strip js- prefix');
    t.end();
});

test('cloudcmd: client: config: input: getValue: checkbox', (t) => {
    const querySelector = stub().returns({
        type: 'checkbox',
        checked: true,
    });
    const element = {querySelector};
    
    const result = getValue('auth', element);
    
    t.ok(result, 'should return checked value');
    t.end();
});

test('cloudcmd: client: config: input: getValue: number', (t) => {
    const querySelector = stub().returns({
        type: 'number',
        value: '42',
    });
    const element = {querySelector};
    
    const result = getValue('port', element);
    
    t.equal(result, 42, 'should return number');
    t.end();
});

test('cloudcmd: client: config: input: getValue: default', (t) => {
    const querySelector = stub().returns({
        type: 'text',
        value: 'hello',
    });
    const element = {querySelector};
    
    const result = getValue('name', element);
    
    t.equal(result, 'hello', 'should return value as is');
    t.end();
});

test('cloudcmd: client: config: input: setValue: checkbox', (t) => {
    const el = {
        type: 'checkbox',
        checked: false,
    };
    const querySelector = stub().returns(el);
    const element = {querySelector};
    
    setValue('auth', true, element);
    
    t.ok(el.checked, 'should set checked');
    t.end();
});

test('cloudcmd: client: config: input: setValue: default', (t) => {
    const el = {
        type: 'text',
        value: 'old',
    };
    const querySelector = stub().returns(el);
    const element = {querySelector};
    
    setValue('name', 'new', element);
    
    t.equal(el.value, 'new', 'should set value');
    t.end();
});
