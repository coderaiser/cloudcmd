import {test} from 'supertape';
import {encodeMarkup} from './encode-markup.js';

test('cloudcmd: encode-markup: ampersand', (t) => {
    const result = encodeMarkup('a&b');
    const expected = 'a&amp;b';
    
    t.equal(result, expected);
    t.end();
});

test('cloudcmd: encode-markup: entity text', (t) => {
    const result = encodeMarkup('&lt;');
    const expected = '&amp;lt;';
    
    t.equal(result, expected);
    t.end();
});

test('cloudcmd: encode-markup: the other characters', (t) => {
    const result = encodeMarkup('<a "b" {c}>');
    const expected = '&lt;a &quot;b&quot; &lcub;c&rcub;&gt;';
    
    t.equal(result, expected);
    t.end();
});

test('cloudcmd: encode-markup: not a string', (t) => {
    const result = encodeMarkup(8000);
    const expected = '8000';
    
    t.equal(result, expected);
    t.end();
});
