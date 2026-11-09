import {readFileSync} from 'node:fs';
import {test} from 'supertape';
import {fromHbs} from './from-hbs.js';

test('cloudcmd: client: config: putout: fromHbs: visible mark', (t) => {
    const result = fromHbs('<ul><li {{ configAuth }} title="A"></li></ul>');
    
    t.match(result, 'data-visible-by="configAuth"');
    t.end();
});

test('cloudcmd: client: config: putout: fromHbs: value placeholder', (t) => {
    const result = fromHbs('<ul><li><input value="{{ name }}"></li></ul>');
    
    t.match(result, 'value=""');
    t.end();
});

test('cloudcmd: client: config: putout: fromHbs: flag placeholder', (t) => {
    const result = fromHbs('<ul><li><input data-name="js-auth" type="checkbox" {{ auth }} ></li></ul>');
    
    t.notMatch(result, '{{');
    t.end();
});

test('cloudcmd: client: config: putout: fromHbs: input is closed', (t) => {
    const result = fromHbs('<ul><li><input data-name="js-auth" type="checkbox" ></li></ul>');
    
    t.match(result, '<input data-name="js-auth" type="checkbox"/>');
    t.end();
});

test('cloudcmd: client: config: putout: fromHbs: select flag', (t) => {
    const result = fromHbs('<ul><li><select><option {{ dark-selected }}>dark</option></select></li></ul>');
    
    t.match(result, '<option >dark</option>');
    t.end();
});

test('cloudcmd: client: config: putout: fromHbs: config.hbs has no placeholders left', (t) => {
    const template = readFileSync(new URL('../../../../tmpl/config.hbs', import.meta.url), 'utf8');
    const result = fromHbs(template);
    
    t.notMatch(result, '{{');
    t.end();
});
