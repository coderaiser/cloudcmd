import {test} from 'supertape';
import {_replaceHash} from './send-request.mjs';

test('cloudcmd: client: io: replaceHash', (t) => {
    const url = '/hello/####world';
    const result = _replaceHash(url);
    const expected = '/hello/%23%23%23%23world';
    
    t.equal(result, expected);
    t.end();
});
