import {readFileSync} from 'node:fs';
import {test} from 'supertape';
import {normalize} from '../fixture/normalize.js';
import {render} from './render.js';

const read = (name) => readFileSync(new URL(name, import.meta.url), 'utf8');
const readConfig = (name) => JSON.parse(read(`../fixture/${name}.json`));
const template = read('../../../../tmpl/config.hbs');

test('cloudcmd: client: config: putout: render: fixture', (t) => {
    const result = normalize(render(readConfig('config'), template));
    const expected = normalize(read('../fixture/form.html'));
    
    t.equal(result, expected);
    t.end();
});

test('cloudcmd: client: config: putout: render: fixture: off', (t) => {
    const result = normalize(render(readConfig('config-off'), template));
    const expected = normalize(read('../fixture/form-off.html'));
    
    t.equal(result, expected);
    t.end();
});

test('cloudcmd: client: config: putout: render: no marks of visibility', (t) => {
    const result = render(readConfig('config-off'), template);
    
    t.notMatch(result, 'data-visible-by');
    t.end();
});

test('cloudcmd: client: config: putout: render: escape', (t) => {
    const result = render({
        ...readConfig('config'),
        name: '<b>"&"</b>',
    }, template);
    
    t.match(result, 'value="&lt;b&gt;&quot;&amp;&quot;&lt;/b&gt;"');
    t.end();
});
