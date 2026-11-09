import {test} from 'supertape';
import {normalize} from './normalize.js';

test('cloudcmd: client: config: normalize: spaces', (t) => {
    const result = normalize('<ul>\n    <li  title="a">\n  Auth\n </li>\n</ul>');
    const expected = '<ul><li title="a">Auth</li></ul>';
    
    t.equal(result, expected);
    t.end();
});

test('cloudcmd: client: config: normalize: attributes order', (t) => {
    const result = normalize('<input value="1" data-name="js-a" checked >');
    const expected = '<input checked data-name="js-a" value="1">';
    
    t.equal(result, expected);
    t.end();
});

test('cloudcmd: client: config: normalize: default type', (t) => {
    const result = normalize('<input type="text" value="1">');
    const expected = '<input value="1">';
    
    t.equal(result, expected);
    t.end();
});

test('cloudcmd: client: config: normalize: type number stays', (t) => {
    const result = normalize('<input type="number">');
    const expected = '<input type="number">';
    
    t.equal(result, expected);
    t.end();
});

test('cloudcmd: client: config: normalize: unquoted attribute', (t) => {
    const result = normalize('<ul class=list>');
    const expected = '<ul class="list">';
    
    t.equal(result, expected);
    t.end();
});

test('cloudcmd: client: config: normalize: self closing tag', (t) => {
    const result = normalize('<input data-name="js-a"/>');
    const expected = '<input data-name="js-a">';
    
    t.equal(result, expected);
    t.end();
});

test('cloudcmd: client: config: normalize: braces entities', (t) => {
    const result = normalize('<input value="&lcub;a&rcub;">');
    const expected = '<input value="{a}">';
    
    t.equal(result, expected);
    t.end();
});

test('cloudcmd: client: config: normalize: attribute names are case insensitive', (t) => {
    const result = normalize('<input autoComplete="username">');
    const expected = '<input autocomplete="username">';
    
    t.equal(result, expected);
    t.end();
});
