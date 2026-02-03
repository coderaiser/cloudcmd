import {test, stub} from 'supertape';
import * as io from './index.mjs';

test('client: dom: io', (t) => {
    const sendRequest = stub();
    
    io.createDirectory('/hello', {
        sendRequest,
    });
    
    const expected = {
        imgPosition: {
            top: true,
        },
        method: 'PUT',
        url: '/fs/hello?dir',
    };
    
    t.calledWith(sendRequest, [expected]);
    t.end();
});
