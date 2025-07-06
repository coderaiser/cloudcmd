import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import fs from 'node:fs';
import test from 'supertape';
import {getThemes, isDev} from './theme.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const distDir = join(__dirname, '..', 'dist-dev');

test('themes: dev', (t) => {
    const themes = getThemes({
        isDev: true,
    });
    
    const css = fs.readFileSync(`${distDir}/themes/dark.css`, 'utf8');
    const result = themes.dark.includes(css);
    
    t.ok(result);
    t.end();
});

test('themes: no args', (t) => {
    const currentIsDev = isDev();
    isDev(true);
    const themes = getThemes();
    
    const css = fs.readFileSync(`${distDir}/themes/light.css`, 'utf8');
    isDev(currentIsDev);
    
    t.match(themes.light, css);
    t.end();
});
