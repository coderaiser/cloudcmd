import {test} from 'supertape';
import {
    fromHtml,
    toHtml,
    html,
} from './html.js';

const template = '<!DOCTYPE html>\n<html>\n    <body></body>\n</html>\n';

test('cloudcmd: common: render: html: fromHtml: removes the doctype', (t) => {
    const result = fromHtml(template);
    
    t.notMatch(result, 'DOCTYPE');
    t.end();
});

test('cloudcmd: common: render: html: fromHtml: keeps an expression', (t) => {
    const result = fromHtml('<p>{fm}</p>');
    
    t.match(result, '<p>{fm}</p>');
    t.end();
});

test('cloudcmd: common: render: html: fromHtml: no rendy placeholders', (t) => {
    const result = fromHtml('<p>{{ fm }}</p>');
    
    t.notMatch(result, '__rendy_');
    t.end();
});

test('cloudcmd: common: render: html: fromHtml: keeps the root', (t) => {
    const result = fromHtml('<html></html>');
    
    t.ok(result.startsWith('<html>'));
    t.end();
});

test('cloudcmd: common: render: html: toHtml: keeps an expression', (t) => {
    const result = toHtml('<p>{fm}</p>;', '<p></p>');
    
    t.match(result, '<p>{fm}</p>');
    t.end();
});

test('cloudcmd: common: render: html: toHtml: changes className', (t) => {
    const result = toHtml('<p className="a"/>;', '<p></p>');
    
    t.match(result, 'class="a"');
    t.end();
});

test('cloudcmd: common: render: html: toHtml: keeps the doctype', (t) => {
    const result = toHtml('<html></html>;', template);
    
    t.ok(result.startsWith('<!DOCTYPE html>'));
    t.end();
});

test('cloudcmd: common: render: html: toHtml: keeps the doctype: lower case', (t) => {
    const result = toHtml('<html></html>;', '<!doctype html>\n<html></html>');
    
    t.ok(result.startsWith('<!doctype html>'));
    t.end();
});

test('cloudcmd: common: render: html: toHtml: no doctype: adds nothing', (t) => {
    const result = toHtml('<p/>;', '<p></p>');
    
    t.notMatch(result, 'DOCTYPE');
    t.end();
});

test('cloudcmd: common: render: html: toHtml: keeps the new line at the end', (t) => {
    const result = toHtml('<html></html>;', template);
    
    t.ok(result.endsWith('\n'));
    t.end();
});

test('cloudcmd: common: render: html: has from', (t) => {
    t.equal(html.from, fromHtml);
    t.end();
});

test('cloudcmd: common: render: html: has to', (t) => {
    t.equal(html.to, toHtml);
    t.end();
});
