import {test, stub} from 'supertape';
import * as io from './index.js';

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

test('client: dom: io: remove: no files', async (t) => {
    const sendRequest = stub();
    
    await io.remove('/hello', null, {
        sendRequest,
    });
    
    const expected = {
        imgPosition: {
            top: false,
        },
        method: 'DELETE',
        url: '/fs/hello',
    };
    
    t.calledWith(sendRequest, [expected]);
    t.end();
});

test('client: dom: io: remove: files', async (t) => {
    const sendRequest = stub();
    const files = ['world'];
    
    await io.remove('/hello', files, {
        sendRequest,
    });
    
    const expected = {
        imgPosition: {
            top: true,
        },
        data: ['world'],
        method: 'DELETE',
        url: '/fs/hello?files',
    };
    
    t.calledWith(sendRequest, [expected]);
    t.end();
});
