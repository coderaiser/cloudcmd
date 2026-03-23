import {test} from 'supertape';
import {convert} from './input.js';

test('cloudcmd: client: config: input: convert', (t) => {
    const result = convert({
        name: 'hello <world>',
    });
    
    const expected = {
        name: 'hello &lt;world&gt;',
    };
    
    t.deepEqual(result, expected);
    t.end();
});

