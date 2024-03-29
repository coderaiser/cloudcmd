import {dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import test from 'supertape';
import fs from 'node:fs';
import {getThemes, isDev} from './theme.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

test('themes: dev', (t) => {
    const themes = getThemes({
        isDev: true,
    });
    
    const css = fs.readFileSync(`${__dirname}/../css/themes/dark.css`, 'utf8');
    
    t.equal(themes.dark, css);
    t.end();
});

test('themes: no args', (t) => {
    const currentIsDev = isDev();
    isDev(true);
    const themes = getThemes();
    
    const css = fs.readFileSync(`${__dirname}/../css/themes/light.css`, 'utf8');
    isDev(currentIsDev);
    
    t.equal(themes.light, css);
    t.end();
});
