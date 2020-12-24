import test from 'supertape';
import parseError from './parse-error.js';

test('user-menu: parse-error', (t) => {
    const result = parseError({
        lineNumber: 1,
        columnNumber: 2,
    });
    
    const expected = [1, 2];
    
    t.deepEqual(result, expected);
    t.end();
});

test('user-menu: parse-error', (t) => {
    const stack = `
        ReferenceError: s is not defined
        at eval (eval at module.exports (get-user-menu.js:NaN), <anonymous>:1:2)
        at module.exports (get-user-menu.js:6)
        at tryCatch (VM12611 try-catch.js:7)
        at AsyncFunction.show (index.js:67)
    `;
    
    const result = parseError({stack});
    const expected = [1, 2];
    
    t.deepEqual(result, expected);
    t.end();
});
