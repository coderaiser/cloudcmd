import test from 'supertape';
import stub from '@cloudcmd/stub';
import mockRequire from 'mock-require';

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
