import {test} from 'supertape';
import {omit} from '#common/omit';

test('cloudcmd: common: omit', (t) => {
    const a = {
        hello: 1,
        world: 2,
    };
    
    const result = omit(a, ['world']);
    
    const expected = {
        hello: 1,
    };
    
    t.deepEqual(result, expected);
    t.end();
});
