'use strict';

const test = require('tape');
const fs = require('fs');
const clean = require('clear-module');
const columnsPath = '../../server/columns';

test('columns', (t) => {
    clean(columnsPath);
    
    const {NODE_ENV} = process.env;
    process.env.NODE_ENV = '';
    const columns = require(columnsPath);
    
    t.equal(columns[''], '', 'should equal');
    process.env.NODE_ENV = NODE_ENV;
    
    t.end();
});

test('columns: dev', (t) => {
    clean(columnsPath);
    const {NODE_ENV} = process.env;
    process.env.NODE_ENV = 'development';
    
    const columns = require(columnsPath);
    const css = fs.readFileSync(`${__dirname}/../../css/columns/name-size-date.css`, 'utf8');
    
    t.equal(columns['name-size-date'], css, 'should equal');
    process.env.NODE_ENV = NODE_ENV;
    
    t.end();
});

