import {readFileSync} from 'node:fs';
import {test} from 'supertape';
import {render} from './render.js';

const read = (name) => readFileSync(new URL(`../${name}`, import.meta.url), 'utf8');
const readConfig = (name) => JSON.parse(read(`fixture/${name}.json`));
const template = read('../../../tmpl/config.hbs');
const removeDependency = (a) => a.replaceAll('            data-enabled-by="auth"\n', '');

test('cloudcmd: client: config: rendy: render: fixture', (t) => {
    const result = removeDependency(render(readConfig('config'), template));
    const expected = read('fixture/form.html');
    
    t.equal(result, expected);
    t.end();
});

test('cloudcmd: client: config: rendy: render: fixture: off', (t) => {
    const result = removeDependency(render(readConfig('config-off'), template));
    const expected = read('fixture/form-off.html');
    
    t.equal(result, expected);
    t.end();
});
