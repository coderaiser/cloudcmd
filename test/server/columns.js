'use strict';

const test = require('supertape');
const fs = require('fs');
const {reRequire} = require('mock-require');
const columnsPath = '../../server/columns';

test('columns', (t) => {
    const {NODE_ENV} = process.env;
    process.env.NODE_ENV = '';
    const columns = reRequire(columnsPath);
    
    process.env.NODE_ENV = NODE_ENV;
    
    t.equal(columns[''], '', 'should equal');
    t.end();
});

test('columns: dev', (t) => {
    const {NODE_ENV} = process.env;
    process.env.NODE_ENV = 'development';
    
    const columns = reRequire(columnsPath);
    const css = fs.readFileSync(`${__dirname}/../../css/columns/name-size-date.css`, 'utf8');
    
    process.env.NODE_ENV = NODE_ENV;
    
    t.equal(columns['name-size-date'], css, 'should equal');
    t.end();
});

