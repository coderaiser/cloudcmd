import {dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import fs from 'node:fs';
import test from 'supertape';
import {getColumns, isDev} from './columns.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
    
    t.ok(columns['name-size-date'].includes(css));
    t.end();
});

test('columns: no args', (t) => {
    const currentIsDev = isDev();
    isDev(true);
    const columns = getColumns();
    
    const css = fs.readFileSync(`${__dirname}/../css/columns/name-size-date.css`, 'utf8');
    isDev(currentIsDev);
    
    t.ok(columns['name-size-date'].includes(css));
    t.end();
});
