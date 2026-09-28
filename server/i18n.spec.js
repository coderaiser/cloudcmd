import {test, stub} from 'supertape';
import {readTranslations} from './i18n.js';

test('cloudcmd: server: i18n: readTranslations: success', (t) => {
    const readFileSync = stub().returns(JSON.stringify({
        hello: 'world',
    }));
    
    const result = readTranslations('pl', {readFileSync});
    const expected = {hello: 'world'};
    
    t.deepEqual(result, expected);
    t.end();
});

test('cloudcmd: server: i18n: readTranslations: fallback on error', (t) => {
    let called = false;
    const readFileSync = stub(() => {
        if (!called) {
            called = true;
            throw Error('ENOENT: no such file or directory');
        }
        return JSON.stringify({hello: 'fallback'});
    });
    
    const result = readTranslations('pl', {readFileSync});
    const expected = {hello: 'fallback'};
    
    t.deepEqual(result, expected);
    t.end();
});

