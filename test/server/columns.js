'use strict';

const test = require('tape');
const fs = require('fs');
const clean = require('clear-module');
const columnsPath = '../../server/columns';

test('columns', (t) => {
    const columns = require(columnsPath);
    t.equal(columns[''], '', 'should equal');
    t.end();
});

test('columns: dev', (t) => {
    clean(columnsPath);
    process.NODE_ENV = 'development';
    
    const columns = require(columnsPath);
    const css = fs.readFileSync(`${__dirname}/../../css/columns/name-size-date.css`, 'utf8');
    
    t.equal(columns['name-size-date'], css, 'should equal');
    t.end();
});
