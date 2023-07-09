'use strict';

const {test, stub} = require('supertape');

const mockRequire = require('mock-require');

const {reRequire, stopAll} = mockRequire;

test('client: dom: io', (t) => {
    const sendRequest = stub();
    mockRequire('./send-request', sendRequest);
    
    const io = reRequire('.');
    
    io.createDirectory('/hello');
    
    const expected = {
        imgPosition: {
            top: true,
        },
        method: 'PUT',
        url: '/fs/hello?dir',
    };
    
    stopAll();
    
    t.calledWith(sendRequest, [expected]);
    t.end();
});
