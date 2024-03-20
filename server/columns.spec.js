'use strict';

const test = require('supertape');
const fs = require('node:fs');
const {getColumns, isDev} = require('./columns');

test('columns: prod', (t) => {
    const columns = getColumns({
        isDev: false,
    });
    
    t.equal(columns[''], '');
    t.end();
});

test('columns: dev', (t) => {
    const columns = getColumns({
        isDev: true,
    });
    
    const css = fs.readFileSync(`${__dirname}/../css/columns/name-size-date.css`, 'utf8');
    
    t.equal(columns['name-size-date'], css);
    t.end();
});

test('columns: no args', (t) => {
    const currentIsDev = isDev();
    isDev(true);
    const columns = getColumns();
    
    const css = fs.readFileSync(`${__dirname}/../css/columns/name-size-date.css`, 'utf8');
    isDev(currentIsDev);
    
    t.equal(columns['name-size-date'], css);
    t.end();
});
