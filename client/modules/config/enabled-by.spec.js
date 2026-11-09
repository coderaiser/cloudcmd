import {readFileSync} from 'node:fs';
import {test} from 'supertape';

const template = readFileSync(new URL('../../../tmpl/config.hbs', import.meta.url), 'utf8');
const getTargets = (a) => Array.from(a.matchAll(/data-enabled-by="([^"]+)"/g), (match) => match[1]);
const getCheckboxes = (a) => Array.from(a.matchAll(/data-name="js-([^"]+)"\s+type="checkbox"/g), (match) => match[1]);

test('cloudcmd: client: config: enabled-by: targets exist', (t) => {
    const targets = getTargets(template);
    const checkboxes = getCheckboxes(template);
    const missing = targets.filter((name) => !checkboxes.includes(name));
    
    const expected = [];
    
    t.deepEqual(missing, expected);
    t.end();
});

test('cloudcmd: client: config: enabled-by: targets are found', (t) => {
    const result = getTargets(template);
    
    const expected = [
        'auth',
        'auth',
    ];
    
    t.deepEqual(result, expected);
    t.end();
});
