import {test} from 'supertape';
import * as entity from '#common/entity';

test('cloudcmd: entity: encode', (t) => {
    const result = entity.encode('<hello> ');
    const expected = '&lt;hello&gt; ';
    
    t.equal(result, expected, 'should encode entity');
    t.end();
});

test('cloudcmd: entity: decode', (t) => {
    const result = entity.decode('&lt;hello&gt; ');
    const expected = '<hello> ';
    
    t.equal(result, expected, 'should decode entity');
    t.end();
});

test('cloudcmd: entity: encode quote', (t) => {
    const result = entity.encode('"hello"');
    const expected = '&quot;hello&quot;';
    
    t.equal(result, expected, 'should encode entity');
    t.end();
});
