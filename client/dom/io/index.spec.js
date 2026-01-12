'use strict';

const {test, stub} = require('supertape');
const io = require('.');

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
