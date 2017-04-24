'use strict';

const test = require('tape');
const dir = '../../../../client/modules/operation';

const removeExtension = require(`${dir}/remove-extension`);

test('cloudcmd: client: modules: operation: removeExtension: .tar.gz', (t) => {
    const name = 'hello';
    const fullName = `${name}.tar.gz`;
    
    t.equal(removeExtension(fullName), name, 'should remove .tar.gz');
    t.end();
});

test('cloudcmd: client: modules: operation: removeExtension: .tar.bz2', (t) => {
    const name = 'hello';
    const fullName = `${name}.tar.bz2`;

    t.equal(removeExtension(fullName), name, 'should remove .tar.bz2');
    t.end();
});

test('cloudcmd: client: modules: operation: removeExtension: .bz2', (t) => {
    const name = 'hello';
    const fullName = `${name}.bz2`;

    t.equal(removeExtension(fullName), name, 'should remove .bz2');
    t.end();
});

