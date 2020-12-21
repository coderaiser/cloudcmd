'use strict';

const test = require('supertape');
const stub = require('@cloudcmd/stub');
const mockRequire = require('mock-require');

const {reRequire} = mockRequire;

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
    
    t.calledWith(sendRequest, [expected]);
    t.end();
});
